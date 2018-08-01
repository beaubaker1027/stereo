const {app, Tray, Menu} = require('electron');
const path = require('path');
const url = require('url');

let win;
const index = `file://${__dirname}/index.html`

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
app.on('ready', createTray)


/*app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  if(win === null) {
    createWindow();
  }
})*/
