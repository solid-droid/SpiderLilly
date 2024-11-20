const { app, BrowserWindow, ipcMain  } = require('electron');
const {beginPuppet, runSimulation } = require('./Simulation/app');
const {compareHighlights} = require('./ImageProcessing/app');
// app.isPackaged || require('electron-reloader')(module);
const path = require('node:path');
var fs = require('fs');
let win;

function debounce(cb, delay = 1000) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      cb(...args)
    }, delay)
  }
}


let onUILoad = debounce((win,message)=>{
  if(message){
    win.webContents.send('statusMessage', message);
    message = null;
  }
  let configPath = path.join(__dirname,'\\config.json');
  let outputPath = path.join(__dirname,'\\output');
  win.webContents.send('helper', 'output:'+outputPath);
  win.webContents.send('helper', 'config:'+configPath);
  if(!fs.existsSync(configPath)){
    fs.writeFileSync(configPath, '{}' );
  }
  const data = fs.readFileSync(configPath, { encoding: 'utf8', flag: 'r' });
  win.webContents.send('helper', 'configData:'+data);
}, 500);



function createWindow() {
  win = new BrowserWindow({
    // width: 1390, 
    // height: 700,
    minWidth:1390,
    minHeight: 700,
    maximizable:true,
    show:false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.maximize();
  win.removeMenu();
  win.show();
  win.loadFile('App/index.html')
  win.webContents.openDevTools()
  win.on('closed', () => {
    win = null
  });

  let message;

  ipcMain.on('runSimulation', async (...args)=>{
    sendStatus(win, 'Processing')
    await runSimulation(...args, win, sendStatus);
  });

  ipcMain.on('compare', async (...args)=>{
    sendStatus(win, 'Comparing')
    await compareHighlights(...args, win, sendStatus)
  });

  ipcMain.on('getMessages', async (...args)=>{
    onUILoad(win,message);
  });

  beginPuppet();
}


function sendStatus(win,message){
  win.webContents.send('statusMessage', message)
}
app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})