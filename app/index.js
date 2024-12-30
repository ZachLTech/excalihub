import puppeteer from "puppeteer";
import { readFile } from 'fs/promises';

async function createRoom() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=817,531']
    });
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    await page.setViewport({
        width: 817,
        height: 531
    });

    const targetPage = page;
    const promises = [];
    const startWaitingForEvents = () => {
        promises.push(targetPage.waitForNavigation());
    };
    startWaitingForEvents();

    await targetPage.goto('https://excalidraw.com/');
    await Promise.all(promises);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const button = await targetPage.waitForSelector('div.layer-ui__wrapper__top-right > div svg');
    await button.click({
        offset: {
            x: 4.87493896484375,
            y: 18.01041603088379,
        }
    });

    await Promise.race([
        targetPage.waitForSelector('::-p-aria(Start session)'),
        targetPage.waitForSelector('body > div.excalidraw div:nth-of-type(3) > button'),
        targetPage.waitForSelector('::-p-xpath(/html/body/div[2]/div/div[2]/div/div/div/div[3]/button)'),
    ]).then(async (element) => {
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

    const roomUrl = await targetPage.evaluate(() => {
        const input = document.querySelector('input[value^="https://excalidraw.com/#room="]');
        return input.value;
    });

    await browser.close();

    return roomUrl
}

async function createRoomFromFile(input) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=817,531']
    });
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    await page.setViewport({
        width: 817,
        height: 531
    });

    await page.goto('https://excalidraw.com');

    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://excalidraw.com', [
        "clipboard-read",
        "clipboard-write",
        "clipboard-sanitized-write",
    ]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.evaluate(async (input) => {
        await navigator.clipboard.writeText(input);
    }, input);

    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.press('v');
    await page.keyboard.up('Control');

    await new Promise(resolve => setTimeout(resolve, 500));

    const button = await page.waitForSelector('div.layer-ui__wrapper__top-right > div svg');
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
        const input = document.querySelector('input[value^="https://excalidraw.com/#room="]');
        return input.value;
    });

    await browser.close();

    return roomUrl
}

async function backupRoom(roomUrl) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--window-size=817,531']
    });
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);
    
    const imageUrls = [];
    const excludedImageUrls = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==',
    ]

    await page.goto(roomUrl);
    await page.setCacheEnabled(false);

    await page.setRequestInterception(true);

    page.on('request', request => {
        if (request.url().includes('data:image') && !excludedImageUrls.includes(request.url()) ) {
            imageUrls.push(request.url())
        }
        request.continue();
    });
    
    await page.waitForNetworkIdle();

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.press('c');
    await page.keyboard.up('Control');
    
    const newPage = await browser.newPage();
    await newPage.goto('https://excalidraw.com');

    await new Promise(resolve => setTimeout(resolve, 2000));

    await newPage.keyboard.down('Control');
    await newPage.keyboard.press('a');
    await newPage.keyboard.press('v');
    await newPage.keyboard.up('Control');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const sceneData = await newPage.evaluate(() => {
        const extractExcalidrawScene = () => {
            const localElements = localStorage.getItem('excalidraw');
            const localAppState = localStorage.getItem('excalidraw-state');
            
            if (localElements) {
                elements = JSON.parse(localElements);
                appState = localAppState ? JSON.parse(localAppState) : {};
            }

            const scene = {
                type: "excalidraw",
                version: 2,
                source: "https://excalidraw.com",
                elements: elements,
                appState: appState,
                files: {}
            };
            
            return scene;
        };
        
        return extractExcalidrawScene();
    });

    sceneData.files = async () => {
        let fileIDs = []
        let filesObject = {}

        for (let i=0; i<sceneData.elements.length; i++) {
            if (sceneData.elements[i].type == 'image') {
                fileIDs.push(sceneData.elements[i].fileId)
            }
        }

        for (let i=0; i<imageUrls.length; i++) {
            filesObject[fileIDs[i]] = {
                "mimeType": imageUrls[i].split('data:')[1].split(';base64')[0],
                "id": fileIDs[i],
                "dataURL": imageUrls[i],
                "created": Math.floor(Date.now() / 1000),
                "lastRetrieved": Math.floor(Date.now() / 1000)
            }
        }

        return filesObject
    }

    sceneData.files = await sceneData.files();
    
    await browser.close();
    return sceneData;
}


// const fileContent = await readFile('./', 'utf-8');
// const cleanContent = '{"' + fileContent
//     .substring(6)
//     .replace(/^\uFEFF/, '')
//     .replace(/\0/g, '');

