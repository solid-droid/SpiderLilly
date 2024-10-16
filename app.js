import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
    headless: false,
    args: [`--window-size=${1100},${810}`]
});
const page = await browser.newPage();

// Navigate the page to a URL.
await page.goto('url');

// Set screen size.
await page.setViewport({width: 1080, height: 720});

await page.focus('#Username')
await page.keyboard.type('s')


page.click('#loginButton');
