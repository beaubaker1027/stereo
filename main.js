const {app, Tray, Notification, Menu, BrowserWindow, webContents, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');


const index = `file://${__dirname}/index.html`
const iconPath = path.join(__dirname, '/Img/casette.png');
const extension = ['.wav', '.mp3', '.ogg', '.m4a', '.aiff', '.au', '.pcm', '.l16', '.webm', '.mp4', '.aac', '.m4p', '.m4b', '.m4r', '.m4v', '.flac' ];


let win;
let tray;
let notification;
let tracks = [];

// read a directory
let readDir = function(file){
  if(!Array.isArray(file)){ return alert('dropped file is not an array'); };
  let dir = file;
  for(el = 0; el < dir.length; el++){
    base = path.parse(dir[el]).base;
    supported = extension.includes(path.parse(dir[el]).ext.toString());
    if(base === '.DS_Store'){ continue; };
    if(fs.statSync(dir[el]).isDirectory()){
      fs.readdirSync(dir[el]).forEach(file => {
        dir.splice((el+1), 0, dir[el]+'/'+file)
      })
      continue;
    }
    if(supported){tracks.push(dir[el]);};
  }
}

//create window
function createWindow() {
  console.log('Creating Window...')
  win = new BrowserWindow({width: 100, height: 100, resizable: false, frame: false, show: false });
  win.loadURL(index);

  win.on('closed', () => {
    win = null;
  })
}

//create a tray
function createTray() {
  console.log('Creating Tray...')
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

  tray.setToolTip('Stereo: A basic Music Player');
  tray.setHighlightMode('never');
  tray.setContextMenu(contextMenu);

  //drop a file into
  tray.on('drop-files', (event, files) => {
    tracks = [];
    readDir(files);
    let fileArray = [];
    tracks.reverse();
    console.log(tracks);
    for(i = 0; i< tracks.length; i++){
      let file = {
        path: '',
        base: ''
      }
      file.path = tracks[i];
      file.base = path.basename(tracks[i]);
    fileArray.push(file);
    }
    win.webContents.send('checkAudio', fileArray);

    //display notification
    ipcMain.on('isAudio?', (event, arg) => {
        notification.close();
      if(arg.arg1 == true) {
        let seperate = files[0].split('/');
        notification.title = 'Currently Playing:';
        notification.body = arg.arg2;
        notification.icon = 'Img/casette.png';
      } else {
        notification.title = 'Error',
        notification.body = 'File: '+arg.arg2+' is not audio'
      }
      notification.show();
    })
  })

}
//app.dock.hide();
app.on('ready', () => {
  console.log('New Casette Initializing...');
  notification = new Notification({});
  createTray();
  console.log('Tray created!');
  createWindow();
  console.log('Window Created!');
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
