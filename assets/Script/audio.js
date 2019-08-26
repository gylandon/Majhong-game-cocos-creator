var bgmAudioID =-2
var bgmVolume =1.0
var sfxVolume =1.0
var checkBgm = 1

var audio ={
    init(){
        var a = cc.sys.localStorage.getItem('bgmVolume');
        if(a != null){
            bgmVolume = parseFloat(a);
        }

        var b = cc.sys.localStorage.getItem("sfxVolume");
        if(b != null){
            sfxVolume = parseFloat(b)
        }
        cc.game.on(cc.game.EVENT_HIDE,function () {
            console.log("cc.audioEngine.pauseAll");
          this.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll");
           this.resumeAll();
        });
    },
    getUrl(url){
        return cc.url.raw("resources/sounds/" + url);
    },

    playBGM(url){
        var audioUrl = this.getUrl(url);
        console.log(audioUrl);
        if(bgmAudioID >= 0){
            cc.audioEngine.stopMusic(bgmAudioID);
        }
        bgmAudioID = cc.audioEngine.playMusic(audioUrl,true,bgmVolume);
        console.log(bgmAudioID)
    },

    playSFX(url){
        var SFXurl = this.getUrl(url);
        if(sfxVolume > 0){
            cc.audioEngine.playEffect(SFXurl,false,sfxVolume)
        }
    },
    pauseBgm(){
        cc.audioEngine.pauseMusic();
    },
    resumeBgm(){
        cc.audioEngine.resumeMusic();
    }
};
module.exports = audio;