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
async function runSimulation(event, {data={}, url='',options={}, output='', recordingName='screenRecording'}) {
  try {
    let offsetX = options.offsetX || 0;
    let offsetY = options.offsetY || 0;
    await page.goto(url);
    await page.setViewport({width: 1920, height: 1080});
    await new Promise(r => setTimeout(r, 1000));
    
    const recorder = new PuppeteerVideoRecorder();
    var dir = output && output !== '' ? output : path.join(__dirname,'').replace('resources\\app.asar\\Simulation','')+'Output';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    await recorder.init(page, dir, recordingName);
    await recorder.start();
    await userSimulation(page, data, offsetX, offsetY)
    await recorder.stop();

  } catch(e) {
    return e;
  }
}

async function userSimulation(page, data, offsetX, offsetY) {
  ///mouse simulation/////////////
  for await(let item of data.mouse){
    if(item.count){
      let i = 0;
      while(i < item.count){
        await mouseEvents(page, item, offsetX, offsetY);
        i++;
      }
    } else{
      await mouseEvents(page, item, offsetX, offsetY);
    }
  };
  ////////////////////////////////
}

async function mouseEvents(page, item, offsetX, offsetY) {
  if(item.type === 'move'){
    await page.mouse.move(item.x+offsetX,item.y+offsetY);
  }
  if(item.type === 'click'){
    await page.mouse.click(item.x+offsetX,item.y+offsetY);
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });
  }
  await new Promise(r => setTimeout(r, 50));
}


module.exports = {runSimulation, beginPuppet};