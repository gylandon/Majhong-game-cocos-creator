var alert = require('Alert')
if(window.io ==null){
    window.io = require('../socket-io')
}

cc.Class({   
    extends: cc.Component,


    properties: {
        nums:{
            type:[cc.EditBox],
            default:[]
        },
        _inputIndex:0,
        name:'',
        img:null
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad(){
        this.img = cc.sys.localStorage.getItem('img')
        this.name = cc.sys.localStorage.getItem('name')
    },

    onEnable:function(){
        this.onResetClicked();
    },

    onInputFinished(){
        var sio =window.io.connect('http://localhost:3000')
        var roomId =  this.parseRoomID();
        
        var data = {
            roomId :roomId,
            userName:this.name,
            img:this.img
        } 
        sio.emit('joinroom',data) 
        sio.on('joininroom_result',function(ret){
            console.log(ret)
            if(ret == 4){
                cc.find('Canvas/joininroom').active = false;
                cc.sys.localStorage.setItem('roomNum',roomId)
                sio.disconnect()
                cc.director.loadScene('game')
                // alert.show('提示',"正在进入房间",0,1);              
            }else if(ret == 1){
                alert.show('提示',"房间" +roomId+ "不存在",1,0);
                // this.onResetClicked();
            }else if(ret == 2){
                alert.show('提示',"房间" +roomId+ "已滿",1,0);
            }
        })
        // var onjoinin =function(ret){
        //     
        // }
    },

    onInput:function(num){
        if(this._inputIndex >= this.nums.length){
            return;
        }
        this.nums[this._inputIndex].string = num;
        this._inputIndex += 1;
        
        if(this._inputIndex == this.nums.length){
            var roomId = this.parseRoomID();
            console.log("ok:" + roomId);
            this.onInputFinished();
        }
    },
    on0Clicked:function(){
        this.onInput(0);
    },
    on1Clicked:function(){
        this.onInput(1);  
    },
    on2Clicked:function(){
        this.onInput(2);
    },
    on3Clicked:function(){
        this.onInput(3);
    },
    on4Clicked:function(){
        this.onInput(4);
    },
    on5Clicked:function(){
        this.onInput(5);
    },
    on6Clicked:function(){
        this.onInput(6);
    },
    on7Clicked:function(){
        this.onInput(7);
    },
    on8Clicked:function(){
        this.onInput(8);
    },
    on9Clicked:function(){
        this.onInput(9);
    },
    onResetClicked:function(){
        for(var i = 0; i < this.nums.length; ++i){
            this.nums[i].string = "";
        }
        this._inputIndex = 0;
    },
    onDelClicked:function(){
        if(this._inputIndex > 0){
            this._inputIndex -= 1;
            this.nums[this._inputIndex].string = "";
            
            
        }
    },
    parseRoomID:function(){
        var str = "";
        for(var i = 0; i < this.nums.length; ++i){
            str += this.nums[i].string;
        }
        return str;
    }
    // update (dt) {},
});
