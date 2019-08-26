
var http = require('../Http')
cc.Class({
    extends: cc.Component,
    properties:{
        _xuanze:null,
        _wanfa:null,
        _jushu:null,  
        _a:[],
        _b:[],
        // alert:cc.Node,
        confirm:cc.Button,
        name:'',
        img:null,
       
    },

    onLoad(){
        this._xuanze=this.node.getChildByName('xuanze')
        this.img = cc.sys.localStorage.getItem('img')
        this.name = cc.sys.localStorage.getItem('name')
        // this.roomId = cc.sys.localStorage.getItem('roomNum')
    },  
    getType(){
        var a = 10
        this._wanfa =this._xuanze.getChildByName('radioBtn')
        for(var i = 0;i<this._wanfa.childrenCount;++i){
            var bool = this._wanfa.children[i].getComponent('radio').checked
            if(bool){
                a = i;
                break;
            }
        }
        return a
    },
    getRules(){
        var b =10
        this._renshu = this._xuanze.getChildByName('jirenju')
        for(var i = 0;i<this._renshu.childrenCount;++i){
            var bool = this._renshu.children[i].getComponent('radio').checked
            if(bool){
                b = i;
                break;
            }
        }
        return b
    },

    createRoom(){
        var sio = window.io.connect('http://localhost:3000')
        var alert = require('Alert');
        var err = this.errMgr();
      
        if(err == 0){     
            alert.show('提示',"请选择玩法",1,0)
        }else if(err == 1){
            alert.show('提示',"请选择人數",1,0)
        }else if(err == 2){
            alert.show('提示',"请选择上述选项",1,0)    
        }else if(err == 3){
            var roomId = this.setRoomId();
            var selected =this.constructSCMJConf(roomId)
            var data = {
                roomId:selected.roomId,
                type:selected.type,
                userName:this.name,
                maxnum:selected.renshu,
                img:this.img
            }
            this.node.active = false;
            var oncreate = function(){
                
            }
            http.Request('/createroom',data,oncreate,3000)
            cc.director.loadScene('game')
            // alert.show('提示',"正在创建房间",0,1);
            // sio.disconnect()
        }
    },   
    setRoomId(){
        var roomId = 0;
        var roomId = Math.round(Math.random()*(999999 - 100000 +1)+100000);
        cc.sys.localStorage.setItem('roomNum',roomId)
        return roomId
    },
    errMgr(){
        var err = 3;
        var p = this.getType()
        var q = this.getRules()
        if(p ==10||q ==10){
            if(p==10 &&q !=10){
                err = 0
            }else if(p!=10&&q==10){
                err =1
            }else if( p ==10&&q==10){
                err2
            }
        }else{
            err =3
        }
        return err;
    },  
    constructSCMJConf(roomId){
        var a = this.getRules();
        var type = this.getType();
        var renshu
        if(a ==0){
            renshu = 2
        }else if(a ==1){
            renshu =3
        }
        var selected = {
            type:type,
            renshu:renshu,
            roomId:roomId   
        }
        return selected;
     },
});
