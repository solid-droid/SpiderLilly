const puppeteer = require('puppeteer');
const {installMouseHelper} = require('./install-mouse-helper.js');
const PuppeteerVideoRecorder = require('../helper/puppeteer-video-recorder/index.js');
const path = require('node:path');
var fs = require('fs');
let browser, page;
let progress = 0;

async function beginPuppet() {
    browser = await puppeteer.launch({
      // headless:false,
      // headless:true,
      headless:'shell'
    });
    page = await browser.newPage();
    await installMouseHelper(page);
}
async function runSimulation(event, {data={}, url='',configFile={}, output='', recordingName='screenRecording'}, win, sendStatus) {
  try {
    url = url.trim();
    let offsetX = configFile.offsetX || 0;
    let offsetY = configFile.offsetY || 0;
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
    sendStatus(win, 'Simulation Started');
    await initScript(configFile , page , url);
    sendStatus(win, 'Init Script Completed, running user events');
    await userSimulation(page, data, offsetX, offsetY);
    sendStatus(win, 'Simulation completed, creating video');
    await recorder.stop();
    sendStatus(win, 'Recording Complete');

  } catch(e) {
    sendStatus(win, e);
  }
}

async function initScript(configFile , page, url){
  if(configFile.init?.script?.length && configFile?.init?.url?.includes(url) ){
    for await (const item of configFile.init.script) {
        await runScript(item, page);
    }
  }
}

async function runScript(data, page){
  switch(data.action){
    case 'type' : await page.type(data.selector , data.value);
    break;
    case 'click' : await page.click(data.selector);
    break;
    case 'wait' : await new Promise(r => setTimeout(r, data.value));
  }
}

async function userSimulation(page, data, offsetX, offsetY) {
  ///mouse simulation/////////////
  for await(const item of data.mouse){
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
  }
  await new Promise(r => setTimeout(r, 100));
}


module.exports = {runSimulation, beginPuppet};