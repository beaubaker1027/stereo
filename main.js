const {app, Tray, Notification, Menu, BrowserWindow, webContents, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const iconPath = path.join(__dirname, '/Img/casette.png');

let win;
let tray;

const index = `file://${__dirname}/index.html`

function createWindow() {
  win = new BrowserWindow({width: 100, height: 100, resizable: false, frame: false, show: false });
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
          type: 'radio',
          click: () => { win.webContents.send('audioCommand', 'play')}
        },
        {
          label: '||',
          type: 'radio',
          click: () => { win.webContents.send('audioCommand', 'pause')}
        },
        {
          label: '\u25a0',
          type: 'radio',
          click: () => { win.webContents.send('audioCommand', 'stop')}
        },
        {
          label: '▷', type: 'radio'
        },
        {
          label: '◁', type: 'radio'
        }
      ]
    }
  ]
  const contextMenu = Menu.buildFromTemplate(template);

  tray.setToolTip('A basic Music Player');
  tray.setContextMenu(contextMenu);
  tray.on('drop-files', (event, files) => {
    let notification = new Notification({});
    let songName = path.basename(files[0]);
    win.webContents.send('checkAudio', files[0]);
    ipcMain.on('isAudio?', (event, arg) => {
      console.log(arg)
      if(arg == true) {
        let seperate = files[0].split('/');
        notification.title = 'Currently Playing:';
        notification.body = songName;
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
app.dock.hide();
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
