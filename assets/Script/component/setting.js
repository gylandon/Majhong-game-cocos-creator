var audio = require("../audio");
var alert = require('./Alert')
cc.Class({
    extends: cc.Component,

    properties: {
      
    },

    // use this for initialization
    onLoad: function () {
 
    },
    
    yyswitch(){
        var _yy = cc.find("Canvas/settingLayer/yinyue");
        var _yychecked = _yy.getComponent("checkbox").checked;
        cc.sys.localStorage.setItem('checkbgm',_yychecked) 
        if(__yychecked){
            audio.resumeBgm()
        }else{
            audio.pauseBgm()
        }
        
    },
    yxswitch(){
        var _yx = cc.find("Canvas/settingLayer/yinxiao");
        var _yxchecked = _yx.getComponent("checkbox").checked;
        cc.sys.localStorage.setItem('checksfx',_yxchecked) 
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
