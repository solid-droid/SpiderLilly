const { app, BrowserWindow, ipcMain  } = require('electron');
const {beginPuppet, runSimulation } = require('./Simulation/app');
app.isPackaged || require('electron-reloader')(module);
const path = require('node:path')
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1390, 
    height: 935,
    minWidth:1390,
    maxWidth: 1390,
    minHeight: 935,
    maxHeight:935,
    maximizable:false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.removeMenu();
  win.loadFile('App/index.html')
  // win.webContents.openDevTools()
  win.on('closed', () => {
    win = null
  });
  ipcMain.on('runSimulation', async (...args)=>{
    win.webContents.send('statusMessage', 'Simulation started');
    let message = await runSimulation(...args);
    setTimeout(() => win.webContents.send('statusMessage', message? message :'Simulation completed'), 1000);
    setTimeout(()=>{win.webContents.send('helper', 'output:'+path.join(__dirname,''))},1000);
  });

  setTimeout(()=>{
    win.webContents.send('helper', 'output:'+path.join(__dirname,'')+'\\Output')
  },1000);
  
  beginPuppet();
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