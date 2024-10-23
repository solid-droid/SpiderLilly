const puppeteer = require('puppeteer');
const {installMouseHelper} = require('./install-mouse-helper.js');
const PuppeteerVideoRecorder = require('../helper/puppeteer-video-recorder/index.js');
const path = require('node:path');
var fs = require('fs');
let browser, page;

async function beginPuppet() {
    browser = await puppeteer.launch({headless:'shell'});
    page = await browser.newPage();
    await installMouseHelper(page);
}
async function runSimulation(event, {data={}, url='',options={}, output=''}) {
  try {
    let offsetX = options.offsetX || 0;
    let offsetY = options.offsetY || 0;
    await page.goto(url);
    await page.setViewport({width: 1920, height: 1080});
    await new Promise(r => setTimeout(r, 100));
    const recorder = new PuppeteerVideoRecorder();
    var dir = output && output !== '' ? output : path.join(__dirname,'').replace('resources\\app.asar\\Simulation','')+'Output';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    await recorder.init(page, dir);
    await recorder.start();
    await new Promise(r => setTimeout(r, 1000));
    for await(let item of data.mouse){
      if(item.type === 'move'){
        await page.mouse.move(item.x+offsetX,item.y+offsetY);
      }
      if(item.type === 'click'){
        await page.mouse.click(item.x+offsetX,item.y+offsetY);
      }
      await new Promise(r => setTimeout(r, 50));
    };
    await recorder.stop();

  } catch(e) {
    return e;
  }
}

module.exports = {runSimulation, beginPuppet};