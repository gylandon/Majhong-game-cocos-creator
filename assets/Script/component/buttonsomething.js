var audio = require("audio");
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
     },

    start () {

    },
    onMousedown(){
      var checksfx = cc.sys.localStorage.getItem('checksfx')
      if(checksfx){
        audio.playSFX("ui_click.mp3");
      }
   
    },
   
    // update (dt) {},
});