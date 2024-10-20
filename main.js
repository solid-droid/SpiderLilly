const { app, BrowserWindow, ipcMain  } = require('electron');
const {beginPuppet, runSimulation } = require('./Simulation/app');
app.isPackaged || require('electron-reloader')(module);
const path = require('node:path')
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800, height: 600, webPreferences: {
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
    win.webContents.send('statusMessage', 'simulation started');
    await runSimulation(...args);
    setTimeout(r => win.webContents.send('statusMessage', 'simulation completed'), 100);
  });
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