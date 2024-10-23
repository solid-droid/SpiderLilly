const { app, BrowserWindow, ipcMain  } = require('electron');
const {beginPuppet, runSimulation } = require('./Simulation/app');
app.isPackaged || require('electron-reloader')(module);
const path = require('node:path')
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
  win.webContents.send('helper', 'output:'+path.join(__dirname,'\\output'));
}, 1000);



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

  let message;

  ipcMain.on('runSimulation', async (...args)=>{
    win.webContents.send('statusMessage', 'Processing');
    message = await runSimulation(...args);
    message = message? message :'Recording Success';
    win.webContents.send('statusMessage', message)
  });


  ipcMain.on('getMessages', async (...args)=>{
    //this line gets called multiple times , use debounce.
    onUILoad(win,message);
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