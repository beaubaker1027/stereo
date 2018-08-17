const {ipcRenderer} = require('electron');

const audio = new Audio;

var AudioClass = {

  //variables
  _fileArray: null,
  current: '',
  track: 0,
  isAudio: '',
  basename: null,
  _audio: audio,

  //get path to current track
  get _path(){
    return this._fileArray[this.track].path;
  },

  //get current time
  get getCurrentTime(){
    return this._audio.currentTime;
  },

  //set current time
  set setCurrentTime(int){
    this._audio.currentTime = int;
  },

  //get audio source
  get audio(){
    return this._audio.src;
  },

  //set _audio source
  set audio(path){
    this._audio.src = path;
    this._audio.load();
  },

  //get basename
  get getBasename(){
    if(this.basename === null){
      this.basename = this.fileArray[this.track].base;
    }
    return this.basename;
  },

  //set basename
  set setBasename(path){
    this.basename = path;
  },

  //resets track to 0
  resetTrack(){
    this.track = 0;
  },

  //skip to next track
  nextTrack(){
    if((this.track + 1) >= this._fileArray.length){
      this.setCurrentTime = 0;
      this.stopAudio();
      return;
    }
    this.track++;
    console.log('track = '+this.track);
    console.log(this._path);
    this.audio = this._path;
    this.playAudio();
  },

  //play previous track
  previousTrack(){
    if(this.getCurrentTime > 2 || this.track == 0){
      this.setCurrentTime = 0;
    } else {
      this.track--;
      this.audio = this._path;
    }
    this.playAudio();
  },

  //stop audio
  stopAudio(){
    this._audio.pause();
    let currentTime = this.getCurrentTime;
    if(this.audio !== undefined){(currentTime == 0)? (this.resetTrack(), this.audio = this._path, this.current = '') : (this.setCurrentTime = 0, this.current = '') }
  },

  //pause audio
  pauseAudio(){
    this._audio.pause();
    this.current = 'pause';
  },
  //play audio from fileArray paths
  playAudio(){
    let audio = this._audio;
    this.audio = this._path;
    if(audio.src === ''){ return; }
    this.setBasename = this._fileArray[this.track].base;
    console.log('loading...')
    audio.play().then(() => {
      console.log('Playing!')
      this.isAudio = true;
      this.current = 'play';
      this.send();
      audio.onended = function(){

        AudioClass.nextTrack();
        return;
      }
    }).catch((error) => {
      console.log(error);
      this.isAudio = false;
      this.current = '';
      this.send();
      this.nextTrack();
    });
  },

  //listens for track ended
  endedListener() {
    this._audio.addEventListener('ended', () => {
      this.nextTrack();
      return;
    })
  },

  //send arguments to Main Process for notification
  send(){
    arguments = {
      arg1: this.isAudio,
      arg2: this.getBasename
    }
    ipcRenderer.send('isAudio?', arguments);
  },
}

ipcRenderer.on('checkAudio', (event, fileArray) => {
  AudioClass._fileArray = fileArray;
  AudioClass.stopAudio();
  AudioClass.resetTrack();
  AudioClass.audio = this._path;
  AudioClass.playAudio();
})

ipcRenderer.on('audioCommand', (event, arg) => {
  if(AudioClass._audio != null){
    switch(arg){
      case 'pause':
        AudioClass.pauseAudio();
        break;
      case 'play':
        if(AudioClass.current !== 'play'){
          if(AudioClass.current === 'pause'){
            AudioClass._audio.play();
          } else {
            AudioClass.playAudio();
          }
        }
        break;
      case 'stop':
      AudioClass.stopAudio();
      AudioClass.current = '';
      break;
      case 'next':
      AudioClass.nextTrack();
      break;
      case 'previous':
      AudioClass.previousTrack();
      break;
    }
  }
})
