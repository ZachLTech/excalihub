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
        headless: false,
        args: ['--window-size=817,531']
    });
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    await page.goto(roomUrl);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Select all and copy
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.press('c');
    await page.keyboard.up('Control');
    
    // Open new tab with clean excalidraw
    const newPage = await browser.newPage();
    await newPage.goto('https://excalidraw.com');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Select all and paste
    await newPage.keyboard.down('Control');
    await newPage.keyboard.press('a');
    await newPage.keyboard.press('v');
    await newPage.keyboard.up('Control');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Execute scene extraction code
    const sceneData = await newPage.evaluate(() => {
        // Your provided extraction code here
        const extractExcalidrawScene = () => {
            try {
                const excalidrawWrapper = document.querySelector('.excalidraw-wrapper');
                const appInstance = excalidrawWrapper?.__reactFiber$?.return?.stateNode;
                
                let elements = [];
                let appState = {};
                
                if (appInstance?.state) {
                    elements = appInstance.state.elements || [];
                    appState = appInstance.state.appState || {};
                } else {
                    const localElements = localStorage.getItem('excalidraw');
                    const localAppState = localStorage.getItem('excalidraw/app-state');
                    
                    if (localElements) {
                        elements = JSON.parse(localElements);
                        appState = localAppState ? JSON.parse(localAppState) : {};
                    }
                }
                
                const scene = {
                    type: "excalidraw",
                    version: 2,
                    source: "https://excalidraw.com",
                    elements: elements,
                    appState: {
                        gridSize: appState.gridSize || null,
                        viewBackgroundColor: appState.viewBackgroundColor || "#ffffff",
                        gridModeEnabled: appState.gridModeEnabled || false
                    },
                    files: {}
                };
                
                return JSON.stringify(scene);
            } catch (error) {
                console.error('Failed to extract scene:', error);
                return null;
            }
        };
        
        return extractExcalidrawScene();
    });
    
    await browser.close();
    return sceneData;
}






// const room = await createRoom();
// const backup = await backupRoom('https://excalidraw.com/#room=e184e813cd5a12b3a8df,C8vJYXT69yl-OfL5OU9Iaw');

// await createRoomFromFile('input.excalidraw')

const fileContent = await readFile('./input.excalidraw', 'utf8')
const roomFromFile = await createRoomFromFile(fileContent)

console.log(roomFromFile)