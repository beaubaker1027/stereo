const {app, Tray, Notification, Menu, BrowserWindow, webContents, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const iconPath = path.join(__dirname, '/Img/casette.png');

let win;
let tray;

const index = `file://${__dirname}/index.html`

function createWindow() {
  win = new BrowserWindow({width: 100, height: 100, resizable: true, frame: false, show: true });
  win.loadURL(index);

  win.on('closed', () => {
    win = null;
  })
}

function createTray() {
  tray = new Tray(iconPath);
  let template = [
    {
      label: 'Stereo',
      submenu: [
        {
          label: '▶︎',
          type: 'normal',
          click: () => { win.webContents.send('audioCommand', 'play')}
        },
        {
          label: '||',
          type: 'normal',
          click: () => { win.webContents.send('audioCommand', 'pause')}
        },
        {
          label: '\u25a0',
          type: 'normal',
          click: () => { win.webContents.send('audioCommand', 'stop')}
        },
        {
          label: '▷',
          type: 'normal',
          click: () => { win.webContents.send('audioCommand', 'next')}
        },
        {
          label: '◁',
          type: 'normal',
          click: () => { win.webContents.send('audioCommand', 'previous')}
        }
      ]
    },
    {
      label: 'Add',
      submenu: [
        {
          label: 'Open Folder',
          type: 'normal'
        }
      ]
    }
  ]
  const contextMenu = Menu.buildFromTemplate(template);

  tray.setToolTip('A basic Music Player');
  tray.setContextMenu(contextMenu);
  tray.on('drop-files', (event, files) => {
    let notification = new Notification({});
    let fileArray = []
    for(i = 0; i< files.length; i++){
      let file = {
        path: '',
        base: ''
      }
      file.path = files[i];
      file.base = path.basename(files[i]);
    fileArray.push(file);
    }
    win.webContents.send('checkAudio', fileArray);
    ipcMain.on('isAudio?', (event, arg) => {
      console.log(arg)
      if(arg.arg1 == true) {
        let seperate = files[0].split('/');
        notification.title = 'Currently Playing:';
        notification.body = arg.arg2;
        /*let notification = new Notification({
          title: 'Song',
          body: songName
        })*/
      } else {
        notification.title = 'Error',
        notification.body = 'File is not audio'
      }
      notification.show();
    })
  })

}
//app.dock.hide();
app.on('ready', () => {
  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  if(win === null) {
    createWindow();
  }
  if(tray === null) {
    createTray();
  }
})
