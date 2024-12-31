import puppeteer from "puppeteer";
import { readFile } from 'fs/promises';
import { writeFile } from 'fs/promises';

// async function createRoom() {
//     const browser = await puppeteer.launch({
//         headless: false,
//         args: ['--window-size=817,531']
//     });
//     const page = await browser.newPage();
//     const timeout = 5000;
//     page.setDefaultTimeout(timeout);

//     await page.setViewport({
//         width: 817,
//         height: 531
//     });

//     const targetPage = page;
//     const promises = [];
//     const startWaitingForEvents = () => {
//         promises.push(targetPage.waitForNavigation());
//     };
//     startWaitingForEvents();

//     await targetPage.goto('https://excalidraw.com/');
//     await Promise.all(promises);

//     await new Promise(resolve => setTimeout(resolve, 1000));

//     const button = await targetPage.waitForSelector('div.layer-ui__wrapper__top-right > div svg');
//     await button.click({
//         offset: {
//             x: 4.87493896484375,
//             y: 18.01041603088379,
//         }
//     });

//     await Promise.race([
//         targetPage.waitForSelector('::-p-aria(Start session)'),
//         targetPage.waitForSelector('body > div.excalidraw div:nth-of-type(3) > button'),
//         targetPage.waitForSelector('::-p-xpath(/html/body/div[2]/div/div[2]/div/div/div/div[3]/button)'),
//     ]).then(async (element) => {
//         await element.click({
//             offset: {
//                 x: 128.32290649414062,
//                 y: 9.315963745117188,
//             }
//         });
//     }).catch(error => {
//         console.error('Failed to find or click the button:', error);
//         throw error;
//     });

//     await new Promise(resolve => setTimeout(resolve, 1000));

//     const roomUrl = await targetPage.evaluate(() => {
//         const input = document.querySelector('input[value^="https://excalidraw.com/#room="]');
//         return input.value;
//     });

//     await browser.close();

//     return roomUrl
// }


/* Used to create either a fresh live room, duplicate a room, make a room from a .excalidraw file, make a room from a read-only link */
async function createRoom(input) { // Input can be #json URL or .excalidraw file. If empty it'll create new empty room
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

    if (input) {
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
                await navigator.clipboard.writeText(input);
            }, input);
    
            await page.keyboard.down('Control');
            await page.keyboard.press('a');
            await page.keyboard.press('v');
            await page.keyboard.up('Control');
    
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } else {
        page.goto('https://excalidraw.com/')
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

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

// To be used for backing up snapshots - Users can also request this from the hub
async function getRoomReadOnlyURL(roomUrl) { // Input should be #room URL
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

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(window, 'onload', {
            get: function() {
                localStorage.setItem('excalidraw-collab', JSON.stringify({
                    "username": "Save In Progress..."
                }));
            }
        });
        
        if (window.location.hostname === 'excalidraw.com') {
            localStorage.setItem('excalidraw-collab', JSON.stringify({
                "username": "Save In Progress..."
            }));
        }
    });

    await page.goto(roomUrl);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const menuButton = await page.waitForSelector('div.layer-ui__wrapper > div > div > div.Stack g');
    await menuButton.click({
        offset: {
            x: 8,
            y: 8
        }
    });

    const exportButton = await page.waitForSelector("[data-testid='json-export-button'] > div.dropdown-menu-item__text");
    await exportButton.click({
        offset: {
            x: 68,
            y: 9
        }
    });

    const linkButton = await page.waitForSelector('body > div.excalidraw div:nth-of-type(2) > button > div');
    await linkButton.click({
        offset: {
            x: 46.140625,
            y: 10.109375
        }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    const readOnlyUrl = await page.evaluate(() => {
        const input = document.querySelector('body > div.excalidraw input');
        return input.value;
    });

    await browser.close();

    return readOnlyUrl
}

// Only used if the user requests it - can also be requested for snapshots
async function getRoomExportFile(roomUrl) { // Input can be #room or #json URL
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
    
    const imageUrls = [];
    const excludedImageUrls = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==',
    ]

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(window, 'onload', {
            get: function() {
                localStorage.setItem('excalidraw-collab', JSON.stringify({
                    "username": "Save In Progress..."
                }));
            }
        });
        
        if (window.location.hostname === 'excalidraw.com') {
            localStorage.setItem('excalidraw-collab', JSON.stringify({
                "username": "Save In Progress..."
            }));
        }
    });

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

// Only used by the snapshot endpoint &
async function getRoomSnapshotImage(roomUrl) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1280,853']
    });
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    await page.setViewport({
        width: 1280,
        height: 853
    });

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(window, 'onload', {
            get: function() {
                localStorage.setItem('excalidraw-collab', JSON.stringify({
                    "username": "Save In Progress..."
                }));
            }
        });
        
        if (window.location.hostname === 'excalidraw.com') {
            localStorage.setItem('excalidraw-collab', JSON.stringify({
                "username": "Save In Progress..."
            }));
        }
    });

    await page.goto(roomUrl);

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.keyboard.down('Alt');
    await page.keyboard.down('Shift');
    await page.keyboard.press('d');
    await page.keyboard.up('Shift');
    await page.keyboard.up('Alt');

    await page.keyboard.down('Control');
    for (let i=0;i<10;i++) {
        await page.keyboard.press('-');
        
    }
    await page.keyboard.up('Control');

    await page.evaluate(() => {
        const ui = document.querySelector('.layer-ui__wrapper');
        if (ui) {
            ui.remove();
        }
    });

    const screenshot = await page.screenshot({
        encoding: 'base64',
        fullPage: true
    });

    await browser.close();

    return `data:image/png;base64,${screenshot}`;
}


/* UNIT TESTS (kinda) */

// File read helper
async function readFileContent(filePath) {
    try {
        const content = await readFile(filePath, 'utf8');
        const singleLine = content.replace(/[\r\n]+/g, '');
        return singleLine;
    } catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}

async function readWriteUnitTest() {
    const fileContent = await readFileContent('./fromFileTest.excalidraw');
    const sharedRoomJSON = await getRoomReadOnlyURL('https://excalidraw.com/#room=27ac7b2ada411ceadfdb,Iv9lZpRRyRWCJ5tdiBZIXQ');

    const roomEmpty = await createRoom();
    console.log(`Empty Room URL: ${roomEmpty}\n`)
    const roomFromJSONURL = await createRoom('https://excalidraw.com/#json=2PQCyGXiW-UoVtqnRNjqV,a1and-9yFYGUi6BHWp0FSA');
    console.log(`Room From JSON Read Only URL: ${roomFromJSONURL}\n`)
    const roomFromFileJSON = await createRoom(fileContent);
    console.log(`Room From Exported .excalidraw File: ${roomFromFileJSON}\n`)
    const roomFromSharedRoom = await createRoom(sharedRoomJSON);
    console.log(`Room From Other Live Room: ${roomFromSharedRoom}\n`)
    const exportedExcalidrawFromReadOnlyURL = await getRoomExportFile('https://excalidraw.com/#json=nYk5vhm8eIwyoroinaBC7,bY_wIeRwzR3nIOy07jUU9Q')
    await writeFile('5est-ExportTest.excalidraw', JSON.stringify(exportedExcalidrawFromReadOnlyURL, null, 2));

    console.log(`File Exported to 'test-ExportTest.excalidraw'!`)
}

async function imageTest() {
    const roomImage = await getRoomSnapshotImage('https://excalidraw.com/#room=ff9ebfa44e19046d5f8d,9ggB11yyAow52rk_GgNWbQ');
    await writeFile('output-image', roomImage);

    console.log(`Image Created and Exported to 'output-image'!`)
}

/* TODO
 * - look into file exporting issue (produces duplicate content)
 * - make deleting room thing
 * - look into exporting excalidraw generated images of the scene & utilizing the options maybe
 * - optimize by checking what overall operations can be truncated to single functions (i.e. snapshotting)
*/