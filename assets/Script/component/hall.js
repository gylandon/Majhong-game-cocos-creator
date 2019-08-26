var audio = require('audio')
var http = require('../Http')

cc.Class({
    extends: cc.Component,

    properties: {
        // avatar:null,
        name :'',
        img:null,
        sio:null
      },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.avatar = 0;    
        audio.playBGM('bgMain.mp3')
        this.sio = window.io.connect('http://localhost:3000')
        this.img = cc.sys.localStorage.getItem('img')
        this.name = cc.sys.localStorage.getItem('name')
        cc.sys.localStorage.setItem('checkbgm',true)
        cc.sys.localStorage.setItem('checksfx',true)
        this.showInfo()
        this.check_in_room()
      
        // wx.getSetting({
        //     success: res => {
        //         if (res.authSetting['scope.userInfo']) {
        //             wx.getUserInfo({
        //                 success: res => {
        //                 self.showInfo(res.userInfo)
        //                 }
        //             })
        //         }
        //     },
        // })
    },

    start () {

    },
    createRoom(){
        this.node.getChildByName('choose').active = true;
    },
    joiningRoom(){
        this.node.getChildByName('joininroom').active = true;
    },
    setting(){
        this.node.getChildByName('settingLayer').active =true
    },
    help(){
        this.node.getChildByName('helpLayer').active =true
    },

    showInfo(ret){
       
        cc.find('Canvas/top/name').getComponent(cc.Label).string = this.name
        var node = cc.find('Canvas/top/avatar').getComponent(cc.Sprite)
        var url = this.img+'?a=a.jpg'
        cc.loader.load(url,function (err,tex) { 
            node.spriteFrame = new cc.SpriteFrame(tex); 
        }); 
    },
    check_in_room(){
        var data ={
            name:this.name,
        }
       
        this.sio.emit('check_in_room',data)
        this.sio.on(this.name+'check_user_inroom_result',function(ret){
            console.log(ret)
            if(ret != 1){
                cc.sys.localStorage.setItem('roomNum',ret.roomid)
                cc.sys.localStorage.setItem('lastAcion',ret.action)
                cc.sys.localStorage.setItem('lastName',ret.name)
                cc.sys.localStorage.setItem('reGame',true)
                cc.director.loadScene('game')
            }else{
                cc.sys.localStorage.setItem('reGame',false)
            }
            
        })
        // this.sio.disconnect()
    }
});
