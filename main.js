const {app, Tray, Menu} = require('electron');
const path = require('path');
const url = require('url');

function createTray() {
  tray = new Tray(path.join(__dirname, '/Img/casette.png'));
  const contextMenu = Menu.buildFromTemplate([
    {label: '▶︎', type: 'radio'},
    {label: '||', type: 'radio'},
    {label: '\u25a0', type: 'radio'},
    {label: '▷', type: 'radio',},
    {label: '◁', type: 'radio'}
  ])

  tray.setToolTip('A basic Music Player');
  tray.setContextMenu(contextMenu);

}
app.on('ready', createTray);
