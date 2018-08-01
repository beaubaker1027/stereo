const {ipcRenderer} = require('electron');

var audio;
var current;

ipcRenderer.on('checkAudio', (event, arg) => {
  let isAudio;
  let send = () => { ipcRenderer.send('isAudio?', isAudio); }
  console.log(arg);
  audio = new Audio(arg);
  let play = audio.play();
  play.then(() => {
    isAudio = true;
    current = 'play';
    send();
  }).catch((error) => {
    console.log(error)
    isAudio = false;
    current = '';
    console.log(isAudio);
    send()
  });
})

ipcRenderer.on('audioCommand', (event, arg) => {
  console.log(current)
  if(audio != null){
    if(arg === 'pause'){
      audio.pause();
      current = 'pause';
    } else if( arg === 'play'){
      audio.play();
      current = 'play';
    } else if( arg === 'stop'){
      audio.pause();
      if(audio.currentTime = 0){
        audio = '';
      } else {
        audio.currentTime = 0;
      }
      current = ''
    }
  }
})
