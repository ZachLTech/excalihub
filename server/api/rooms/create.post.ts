import { getServerSession } from "#auth";
import puppeteer from "puppeteer";

/* 
    Body Structure:
    {
        name: '',
        description: '',
        thumbnail: '',
        roomType: '',
        status: '',
        readOnlyUrl: '',
        excalidrawFile: ''
    }
*/

// If readonlyurl, create with that, if excalidrawurl, create with that.

function generateRandomBase64(length: number) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, [...array]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

async function createRoom(input?: any) { // Input can be #json URL or .excalidraw file. If empty it'll create new empty room
    if (!input) {
        const roomId = generateRandomBase64(20);
        const encryptionKey = generateRandomBase64(24).slice(0, 22);
        
        return `https://excalidraw.com/#room=${roomId},${encryptionKey}`;
    }
    
    const browser = await puppeteer.connect({ 
        browserWSEndpoint: 'wss://browserless.zachl.tech',
    });
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    await page.setViewport({
        width: 817,
        height: 531
    });

    if (input.includes('excalidraw.com/#json=')) {
        await page.goto(input);
        await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
        await page.goto('https://excalidraw.com');

        const context = browser.defaultBrowserContext();
        await context.overridePermissions('https://excalidraw.com', [
            "clipboard-read",
            "clipboard-write",
            "clipboard-sanitized-write",
        ]);

        await new Promise(resolve => setTimeout(resolve, 2000));

        await page.evaluate(async (input) => {
            // @ts-ignore
            await navigator.clipboard.writeText(input);
        }, input);

        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.press('v');
        await page.keyboard.up('Control');

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const button = await page.waitForSelector('div.layer-ui__wrapper__top-right > div svg');
    if (!button) {
        throw createError({
            statusCode: 501,
            statusMessage:
                "There was an issue creating your room.",
        });
    }
    await button.click({
        offset: {
            x: 4.87493896484375,
            y: 18.01041603088379,
        }
    });

    await Promise.race([
        page.waitForSelector('::-p-aria(Start session)'),
        page.waitForSelector('body > div.excalidraw div:nth-of-type(3) > button'),
        page.waitForSelector('::-p-xpath(/html/body/div[2]/div/div[2]/div/div/div/div[3]/button)'),
    ]).then(async (element) => {
        if (!element) {
            throw createError({
                statusCode: 501,
                statusMessage:
                    "There was an issue creating your room.",
            });
        }
        await element.click({
            offset: {
                x: 128.32290649414062,
                y: 9.315963745117188,
            }
        });
    }).catch(error => {
        console.error('Failed to find or click the button:', error);
        throw error;
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const roomUrl = await page.evaluate(() => {
        // @ts-ignore
        const input = document.querySelector('input[value^="https://excalidraw.com/#room="]');
        return input.value;
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    await browser.close();

    return roomUrl
}

export default eventHandler(async (event) => {
    const body = await readBody(event);
    const session = await getServerSession(event);

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: "You are not authorized to call this API.",
        });
    }

    const userEmail = session.user?.email;
    const user = await event.context.prisma.user.findUnique({
        where: {
            email: userEmail as string | undefined,
        },
    });

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage:
                "The provided user does not exist.",
        });
    }

    const newData: any = {
        userId: user.id
    };

    if (body.name) {
        newData.name = body.name;
    } else {
        throw createError({
            statusCode: 401,
            statusMessage:
                "A room name is required but wasn't provided.",
        });
    }

    if (body.description) {
        newData.description = body.description;
    }

    if (body.thumbnail) {
        if (body.thumbnail.length >= 15 * 1024 * 1024) {
            throw createError({
                statusCode: 401,
                statusMessage:
                    "The thumbnail image can't be larger than 15MB",
            });
        }
        newData.thumbnail = body.thumbnail;
    }

    if (body.roomType && (body.roomType == 'NORMAL' || body.roomType == 'TEMPLATE' || body.roomType == 'TEMPORARY')) {
        newData.roomType = body.roomType;
    }

    if (body.status && (body.status == 'LIVE' || body.status == 'LOCAL' || body.status == 'ARCHIVED')) {
        newData.status = body.status;
    }

    if (body.excalidrawUrl) {
        newData.excalidrawUrl = body.excalidrawUrl;
    }

    if (body.readOnlyUrl) {
        newData.readOnlyUrl = body.readOnlyUrl;
    }

    if (body.excalidrawFile) {
        newData.excalidrawUrl = await createRoom(body.excalidrawFile)
    } else if (body.readOnlyUrl) {
        newData.excalidrawUrl = await createRoom(body.readOnlyUrl)
    } else {
        newData.excalidrawUrl = await createRoom()
    }
    
    const newRoom = await event.context.prisma.room.create({
        data: newData
    });

    return newRoom;
});
