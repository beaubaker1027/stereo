const {ipcRenderer} = require('electron');

var _audio;
var _fileArray;
var current;
var i;
var isAudio;
var basename;

var AudioClass = {

  //variables
  _fileArray: null,
  current: '',
  track: 0,
  isAudio: '',
  basename: null,
  _audio: new Audio,

  //get _audio
  getAudio(){
    return this._audio;
  },

  //set _audio
  setAudio(path){
    this._audio.src = path;
  },

  //gets current time of audio track
  getCurrentTime(){
    return this.getAudio().currentTime;
  },

  //sets current time of audio track
  setCurrentTime(int){
    this.getAudio().currentTime = int;
  },

  //get _fileArray
  getFileArray(){
    return this._fileArray;
  },

  //set _fileArray
  setFileArray(file){
    this._fileArray = file;
  },

  //get current
  getCurrent(){
    return this.current;
  },

  //set current
  setCurrent(current){
    this.current = current;
  },

  //get track
  getTrack(){
    return this.track;
  },

  //sets track to zero
  resetTrack(){
    this.track = 0;
  },
  //set track
  setTrack(int){
    this.track += int;
  },

  //get isAudio
  getIsAudio(){
    console.log(this.isAudio);
    return this.isAudio;
  },

  //set isAudio
  setIsAudio(bool){
    this.isAudio = bool;
    console.log(this.isAudio);
  },

  //get path of current track
  getPath(){
    console.log(this.getFileArray()[this.getTrack()].path);
    return this.getFileArray()[this.getTrack()].path;
  },

  //get basename
  getBasename(){
    if(this.basename === null){
      this.setBasename(this.getFileArray(), this.getTrack());
    }
    return this.basename;
  },

  //set basename
  setBasename(fileArray, track){
    this.basename = fileArray[track].base;
  },

  //skip to next track
  // problem with skipping last song and first song stops working
  nextTrack(){
    if((this.getTrack() + 1) >= this.getFileArray().length){
      this.stopAudio();
      return;
    }
    this.setTrack(1);
    this.setAudio(this.getPath());
    this.playAudio();
  },

  //play previous track
  previousTrack(){
    let currentTrack = this.getAudio();
    if(currentTrack.currentTime > 2 || this.getTrack() == 0){
      currentTrack.currentTime = 0;
    } else {
      this.setTrack(-1);
      this.setAudio(this.getPath());
    }
    this.playAudio();
  },

  //stop audio
  stopAudio(){
    let audio = this.getAudio();
    if(audio.src !== undefined){(audio.currentTime == 0)? (this.resetTrack(), this.setAudio(this.getPath())) : (audio.pause(), this.setCurrentTime(0)) }
  },

  //play audio from fileArray paths
  playAudio(){
    this.getAudio().play().then(() => {
      this.setIsAudio(true);
      this.setCurrent('play');
      this.setBasename(this.getFileArray(), this.getTrack());
      this.send();
    }).catch((error) => {
      console.log(error);
      this.setIsAudio(false);
      this.setCurrent('');
      this.send();
      this.nextTrack();
    });
    this.endedListener();
  },

  //listens for track ended
  endedListener() {
    this.getAudio().addEventListener('ended', () => {
      if(this.getTrack()+1 < this.getFileArray().length){
        this.setTrack(1);
      } else {
        this.stopAudio();
        return
      }
      this.playAudio();
    })
  },

  //send arguments to Main Process for notification
  send(){
    arguments = {
      arg1: this.getIsAudio(),
      arg2: this.getBasename()
    }
    ipcRenderer.send('isAudio?', arguments);
  },
}

ipcRenderer.on('checkAudio', (event, fileArray) => {
  AudioClass.setFileArray(fileArray);
  AudioClass.stopAudio();
  AudioClass.resetTrack();
  AudioClass.setAudio(AudioClass.getPath());
  AudioClass.playAudio();
})

ipcRenderer.on('audioCommand', (event, arg) => {
  if(AudioClass.getAudio() != null){
    switch(arg){
      case 'pause':
        AudioClass.getAudio().pause();
        break;
      case 'play':
        if(AudioClass.getCurrent() !== 'play'){
          AudioClass.getAudio().play()
        }
        break;
      case 'stop':
      AudioClass.stopAudio();
      AudioClass.setCurrent('');
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
