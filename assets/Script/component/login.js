const http =require('../Http')
const alert = require('./Alert')
cc.Class({
    extends: cc.Component,

    properties: {
          // defaults, set visually when attaching this script to the Canvas
          
    },

    // use this for initialization
    onLoad: function () {
        var self =this
        wx.login({
            success: function(res) {
                if (res.code) {
                    self.getLogin(res.code);
                    wx.getSetting({
                        success(res) {
                            if(res.authSetting['scope.userInfo']) {
                                wx.getUserInfo({
                                    success:function(res){
                                        var name = res.userInfo.nickName
                                        var img = res.userInfo.avatarUrl
                                        self.changeToHall(name,img)
                                    }
                                })   
                            }
                        },
                    })
                
                }else {
                    console.log('登录失败！' + res.errMsg)
                }
            }
        });
    },
       
        
    getLogin(code){
        var data = {
            code:code
        }
        var onlogin =function(ret){
            console.log(ret)
        }
        http.Request('/get',data,onlogin,3000)

    },
    login(){
        var self = this
        wx.getUserInfo({
            success:function(ret){
                var username = ret.userInfo.nickName
                var img = ret.userInfo.avatarUrl
                self.create_user(username,img)
            },
            fail:function(res1){
                self.refuse()
            }  
        })
    },
    create_user(name,img){
        var data ={
            name:name,
            img:img
        }
        // window.Global.player = name
        // window.Global.img = img
        cc.sys.localStorage.setItem('name',name)
        cc.sys.localStorage.setItem('img',img)
        var oncreate =function(){
            cc.director.loadScene('hall')
        }
        http.Request('/create_user',data,oncreate,3000)
    },
    refuse(){
        alert.show1('提示','您没有授权，将无法进入游戏，请授权后进去！')
    },
    changeToHall(name,img){
        cc.find('Canvas/wait').active = true
        cc.sys.localStorage.setItem('name',name)
        cc.sys.localStorage.setItem('img',img)
        cc.director.loadScene('hall')
    },

    // update: function (dt) {
       
      
    // },
});
