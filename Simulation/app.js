const puppeteer = require('puppeteer');
const {installMouseHelper} = require('./install-mouse-helper.js');
const PuppeteerVideoRecorder = require('puppeteer-video-recorder');
const path = require('node:path')
let browser, page;
// "C:/Files/Projects/SpiderLilly/Simulation/ffmpeg/bin/ffmpeg.exe"

async function beginPuppet() {
    browser = await puppeteer.launch({headless:'shell'});
    page = await browser.newPage();
    await installMouseHelper(page);
}
async function runSimulation(event, {data={}, url='',options={}}) {
    let offsetX = options.offsetX || 0;
    let offsetY = options.offsetY || 0;
    await page.goto(url);
    await page.setViewport({width: 1920, height: 1080});
    const recorder = new PuppeteerVideoRecorder();
    await recorder.init(page, path.join(__dirname, ''));
    await recorder.start();
    await page.$('.octicon octicon-mark-github');
    for await(let item of data.mouse){
      await page.mouse.move(item.x+offsetX,item.y+offsetY);
      await new Promise(r => setTimeout(r, 50));
    };
    await page.screenshot({
      path: 'screenshot.jpg'
    });
    await recorder.stop();
}

module.exports = {runSimulation, beginPuppet};