var audio = require('audio')
// var io = require('../socket.io')


cc.Class({
    extends: cc.Component,

    properties: {
        name:'',
        img:null,
        sio:null,
        _pai:null,
        _maxnum:null,
        _seats:null,
        _playnode:cc.Node,
        _preparenode:cc.Node,
        roomId:0,
        _pool:null,
        _type:null,
        qiangpai:null,
        luckyBoy:'',
        winner:'',
        _time:null,
        coin:null,
        num:0,
        _img:null,
        regame:null,
        checksfx:null,
        qiangnum:0,
        lastActionName:'',
        _readyList:null,
        lastRecieveTime:null,
        lastSendTime:null,
        isPinging:false,
        missCount:0
    },
    onLoad(){
        var self =this
        this._seats = []
        this._pool =[],
        this._img =[],
        this._readyList =[]
        var checkbgm = cc.sys.localStorage.getItem('checkbgm') 
        this.regame = cc.sys.localStorage.getItem('reGame') 
        this.checksfx = cc.sys.localStorage.getItem('checksfx')
        if(checkbgm){
            audio.playBGM('bgm2.mp3')
        }
        this._pai = []
        this.qiangpai =[]
        this.img = cc.sys.localStorage.getItem('img')
        this.name = cc.sys.localStorage.getItem('name')
        this.roomId = cc.sys.localStorage.getItem('roomNum')
        this._time = new Date()
       
        var data = {
            roomId:this.roomId,
            userName:this.name,
            img:this.img
        }
        var opts = {
            'reconnection':false,
            'force new connection': true,
            'transports':['websocket', 'polling']
        }
        this.sio = window.io.connect('http://localhost:3000',opts)
        this.heartBeat()
        this.sio.emit('checkOver',data)
        this.sio.on('room_delete',function(){
            const index = self._seats.indexOf(self.name) 
            self._seats.splice(index,1)
            self._img.splice(index,1)
            self.back_to_hall()
        })
        this.initView()
    },
    heartBeat(){
        var self =this
        this.sio.on('game_pong',function(){
            console.log('game_pong');
            self.lastRecieveTime = Date.now();
            console.log(self.lastRecieveTime)
        });
        this.lastRecieveTime = Date.now();
        if(!self.isPinging){
            self.isPinging = true;
            console.log(1)
            cc.game.on(cc.game.EVENT_HIDE,function(){
                self.ping();
            });
            setInterval(function(){
                if(self.sio){
                    self.ping();                
                }
            }.bind(this),5000);
            setInterval(function(){
                if(self.sio){
                    if(Date.now() - self.lastRecieveTime > 8000){
                        cc.find('Canvas/netWaiting').active =true
                        self.waiting()
                    }         
                }
            }.bind(this),500);
        }   
    },
    waiting(){
        var self =this
        self.ping()
        console.log(self.lastRecieveTime)
        var id = setInterval(function(){
            if(Date.now() - self.lastRecieveTime < 1000){
                self.regame = true
                cc.find('Canvas/netWaiting').active =false
                clearInterval(id)
                self.initView() 
            }
        }.bind(this),500)
    },
    ping:function(){
        if(this.sio){
            this.lastSendTime = Date.now();
            var data ={
                name:this.name
            }
            this.sio.emit('game_ping',data);
        }
    },
    
    close:function(){
        console.log('close');
        if(this.sio ){
            this.sio.disconnect();
        }
        this.sio = null;
    },

    initView(){
        var self =this
        var data = {
            roomId:this.roomId,
            userName:this.name,
            img:this.img
        }
        this.sio.emit('game',data)
        this.sio.emit('get_user_info',this.name)
        this.sio.on(this.name+'get_user_info',function(msg){
            self.coin = msg.coin
            self.node.getChildByName('top').getChildByName('num').getComponent(cc.Label).string = msg.coin   
        })

        this.sio.on('get_base_info',function(data){
            var topinfo = cc.find('Canvas/top/info')
            self._type =data.ret.type
            var type =''
            data.ret.type =='0'? type = '初級玩法':type = '高級玩法'
            self._maxnum = data.ret.maxnum
            if(self._maxnum ==3){
                self._playnode = cc.find('Canvas/3')
            }else if(self._maxnum ==2){
                self._playnode = cc.find('Canvas/2')
            }
            var str = type+'   '+data.ret.maxnum+'人局';
            topinfo.getChildByName('type').getComponent(cc.Label).string = str;
            topinfo.getChildByName('roomid').getComponent(cc.Label).string = data.ret.roomid;

            if(self._maxnum ==3){
                self._preparenode = cc.find('Canvas/prepare/3');
                self._preparenode.active =true;
            }else if(self._maxnum ==2){
                self._preparenode = cc.find('Canvas/prepare/2');
                self._preparenode.active =true;
            }
        });
        console.log(this.regame)
        if(this.regame){
            self.regame1();
        }else{
            this.getReady(-1);
            this.qiangfunction(-1);
            this.showView(-1);
            this.result(-1);
        }
       
    },
    regame1:function(){
        var self =this;
        var data = {
            name:this.name,
            roomId:this.roomId
        };
        this.sio.emit('reGame',data);
        this.sio.on(this.name+'reGame',function(msg){ 
            self.lastActionName = msg.name;
            var action = msg.action;
            self._pai = msg.pai;
            self._pool = msg.pool;
            self._img = msg.img;
            self.qiangnum = msg.qiangnum;
            self._readyList = msg.ready;
            self._seats = msg.seats;
            self.qiangpai = msg.qiangList;
            if(action == 0){
                self.getReady(action);
                self.qiangfunction(action);
                self.showView(action);
                self.result(action);
            }else if(action ==1){
                self.Same();
                self.qiangfunction(action);
                self.showView(action);
                self.result();
                
            }else if(action ==2){
                self.Same();
                self.showView(action);
                self.result(action);
            }
        });
    },
    getReady:function(action){
        var self = this;
        if(action ==0){
            for(var i=0;i<self._seats.length;++i){
                self._preparenode.children[i].getChildByName('name').getComponent(cc.Label).string = self._seats[i];
                const avatar = self._preparenode.children[i].getChildByName('img')
                if(self._readyList.indexOf(self._seats[i]) !=-1){
                    self._preparenode.children[i].getChildByName('name').color = new cc.Color(0,255,255);
                    if(self._seats[i] == self.name){
                        cc.find('Canvas/prepare/ready').active =false
                    }
                }
                cc.loader.load({url:self._img[i],type:'jpg'},function (err,tex) { 
                    avatar.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex); 
                }); 
            }  
        }
        this.sio.on(this.name+'get_base_info',function(data){
            for(var i=0;i<data.seats.length;++i){
                self._preparenode.children[i].getChildByName('name').getComponent(cc.Label).string = data.seats[i];
                const avatar = self._preparenode.children[i].getChildByName('img')
                self._seats[i] = data.seats[i]
                self._img[i] = data.img[i]
                if(data.ready.indexOf(self._seats[i]) !=-1){
                    self._preparenode.children[i].getChildByName('name').color = new cc.Color(0,255,255);
                    if(self._seats[i] == self.name){
                        cc.find('Canvas/prepare/ready').active =false
                    }
                }
                cc.loader.load({url:data.img[i],type:'jpg'},function (err,tex) { 
                    avatar.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex); 
                }); 
            }  
        })
            
            this.sio.on('notify_user',function(data){
                console.log(data.name+'join in room');
                if(self._seats.indexOf(data.name)== -1){//如果新加入的玩家是第一次进入房间
                    var a = self._seats.indexOf(data.name);
                   
                    self._seats.push(data.name);
                    self._img.push(data.img);
                    a =self._seats.length-1;
                    
                    // var url =data.img+'?a'+self._seats.length+'=a.jpg';
                    var newnode = self._preparenode.children[a];
                    newnode.getChildByName('name').getComponent(cc.Label).string = data.name;
                    cc.loader.load({url:data.img,type:'jpg'},function (err,tex) { 
                        newnode.getChildByName('img').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex); 
                    });
                }
                // }else{

                // }
                  
                
            });
            this.sio.on('ready_back',function(msg){
                var index = self._seats.indexOf(msg);
                self._preparenode.children[index].getChildByName('name').color = new cc.Color(0,255,255);
            });
        
    },

    ready:function(){
        var data = {
            name:this.name,
            roomId:this.roomId
        };
        this.sio.emit('ready',data);
        cc.find('Canvas/prepare/ready').active =false;
    },
    buqiang:function(){
        cc.find('Canvas/qiangpai/qiang_btn').active =false;
            var msgBean ={
                name:this.name,
                roomId: this.roomId,
                seats:this._seats,
                score:0,
                beginName:this.luckyBoy,
            };
            this.sio.emit('qiangpai', msgBean);
    },
    qiang1:function(){
        cc.find('Canvas/qiangpai/qiang_btn').active =false;
        if(self.coin <1){
            cc.find('Canvas/share').active =true
        }else{
            var msgBean1 ={
                name:this.name,
                roomId: this.roomId,
                seats:this._seats,
                score:1,
                beginName:this.luckyBoy,
            };
            this.sio.emit('qiangpai', msgBean1);
        } 
    },
    qiang2:function(){
        cc.find('Canvas/qiangpai/qiang_btn').active =false;
        if(self.coin <1){
            cc.find('Canvas/share').active =true
        }else{
            var msgBean2 ={
                name:this.name,
                roomId: this.roomId,
                seats:this._seats,
                score:2,
                beginName:this.luckyBoy,
            };
            this.sio.emit('qiangpai', msgBean2);
        }  
    },
    qiang3:function(){
        cc.find('Canvas/qiangpai/qiang_btn').active =false;
        if(self.coin <1){
            cc.find('Canvas/share').active =true
        }else{
            var msgBean3 ={
                name:this.name,
                roomId: this.roomId,
                seats:this._seats,
                score:3,
                beginName:this.luckyBoy,
            };
            this.sio.emit('qiangpai', msgBean3);
        }  
    },
    chupai:function(){
        var node1 = this._playnode.getChildByName('1').getChildByName('1');
        node1.getComponent(cc.Button).interactable = false;
        var target =this._pai[0];
        console.log(target)
        console.log(this._pai)
        console.log(this._pool)
        this._pai.splice(0,1);
        this._pool.push(target);
        var a =this.checkSame(target);
        if(a ==0){
            var data = {
                roomId:this.roomId,
                target: target,
                pool:this._pool,
                name :this.name,
                seats: this._seats,
                pai:this._pai
            };
            this.sio.emit('showview',data);
        }
     
        this.getSpriteByUrl(node1,this._pai[0]);
        var data1 = {
            name:this.name,
            seats:this._seats,
            roomId:this.roomId
        };
        this.sio.emit('nextplay',data1);
        
    },
    checkSame:function(msg){
        var target = msg;
        this.num = this._pool.length
        console.log(msg,this._type);
        var a = target.slice(3);
        var c=0;
        var d=0;
        var suit = target.slice(0,3);
        if(suit == 'mh_'||suit =='ht_'){
            c = 0;
        }else{
            c =1;
        }
        if(this._type == 0){
            for(var i=0;i<this._pool.length-1;++i){
                var b = this._pool[i].slice(3);
                if(a == b){
                    for(var j = i ;j<this._pool.length;++j){
                        this._pai.push(this._pool[j]);
                    }
                    this._pool.splice(i);
                    var data ={
                        roomId:this.roomId,
                        pool:this._pool,
                        name :this.name,
                        seats:this._seats,
                        pai:this._pai
                    };
                    this.sio.emit('little_win',data);
                    return 1;
                }
            }
        }else{
            for(var p=0;p<this._pool.length-1;++p){
                var e = this._pool[p].slice(3);
                var suit1 = this._pool[p].slice(0,3);
                if(suit1 == 'mh_'||suit1 =='ht_'){
                    d = 0;
                }else{
                    d =1;
                }
                if(a == e){
                    if(c==d){
                        for(var q = p ;q<this._pool.length;++q){
                            this._pai.push(this._pool[q]);
                        }
                        this._pool.splice(p);
                        var data1 ={
                            roomId:this.roomId,
                            pool:this._pool,
                            name :this.name,
                            seats:this._seats,
                            pai:this._pai
                        };
                        this.sio.emit('little_win',data1);
                        // var data2 = {
                        //     index:index,
                        //     i:p
                        // };
                        // return data2;
                        return 1;
                    }
                    
                }    
            }
        }
        return 0;
    },
    Same(){
        var self = this
        self._playnode.active =true;
        self.node.getChildByName('prepare').active =false;
        var index = self._seats.indexOf(self.name);
        for(var i=index;i<(self._seats.length +index);++i){
            var j = i % self._seats.length;//seats[]的坐標
            var q = i-index +1;//本地坐標
            var p = q.toString();
            self._playnode.getChildByName(p).getChildByName('name').getComponent(cc.Label).string = self._seats[j];
            const avatar = self._playnode.getChildByName(p).getChildByName('avatar').getComponent(cc.Sprite);
            cc.loader.load({url:self._img[j],type:'jpg'},function (err,tex){ 
                avatar.spriteFrame = new cc.SpriteFrame(tex); 
            });
        }
        self._playnode.getChildByName('1').getChildByName('numOfPoke').getComponent(cc.Label).string = self._pai.length;
        var node1 = self._playnode.getChildByName('1').getChildByName('1');
        self.getSpriteByUrl(node1,self._pai[0]);
        self._playnode.getChildByName('2').getChildByName('2').active = true;
        if(this._maxnum == 3){
            self._playnode.getChildByName('3').getChildByName('3').active = true;
        }
        if(j == 0 ){
            self._playnode.getChildByName(p).getChildByName('host').active =true
        }
    },
    qiangfunction(action){
        var self =this
        if(action ==1){
            for(var i=0;i<self.qiangpai.length;++i){
                var node = cc.find('Canvas/qiangpai/pai').children[i];
                self.getSpriteByUrl(node,self.qiangpai[i]);
            }
            cc.find('Canvas/qiangpai').active = true; 
            if(self.qiangnum ==0){
                if(self.name ==self.lastActionName){
                    cc.find('Canvas/qiangpai/qiang_btn').active = true;
                    if(self.coin <1){
                        cc.find('Canvas/qiangpai/qiang_btn/1').getComponent(cc.Button).interactable = false;
                        cc.find('Canvas/qiangpai/qiang_btn/2').getComponent(cc.Button).interactable = false;
                        cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
                    }else if(self.coin <2&&self.coin>=1){
                        
                        cc.find('Canvas/qiangpai/qiang_btn/2').getComponent(cc.Button).interactable = false;
                        cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
                    }else if(self.coin <3&&self.coin>=2){ 
                        cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
                    }
                }
            }else{
                var a = self._seats.indexOf(self.lastActionName)
                var index1 = (a+1) % self._maxnum
                if(self.name == self._seats[index1]){
                    cc.find('Canvas/qiangpai/qiang_btn').active = true;
                    if(self.coin <1){
                        cc.find('Canvas/qiangpai/qiang_btn/1').getComponent(cc.Button).interactable = false;
                        cc.find('Canvas/qiangpai/qiang_btn/2').getComponent(cc.Button).interactable = false;
                        cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
                    }else if(self.coin <2&&self.coin>=1){
                        
                        cc.find('Canvas/qiangpai/qiang_btn/2').getComponent(cc.Button).interactable = false;
                        cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
                    }else if(self.coin <3&&self.coin>=2){ 
                        cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
                    }
                }
            }
        }else{
            this.sio.on('player_show',function(msg){
                var index = msg.seats.indexOf(self.name);
                // if(this.regame&&this.action ==1) 
                self._playnode.active =true;
                for(var i=index;i<(msg.seats.length +index);++i){
                    var j = i % msg.seats.length;//seats[]的坐標
                   
                    var q = i-index +1;//本地坐標
                    var p = q.toString();
                    if(j == 0 ){
                        self._playnode.getChildByName(p).getChildByName('host').active =true
                    }
                    self._playnode.getChildByName(p).getChildByName('name').getComponent(cc.Label).string = msg.seats[j];

                    const avatar = self._playnode.getChildByName(p).getChildByName('avatar').getComponent(cc.Sprite);
                    cc.loader.load({url:msg.img[j],type:'jpg'},function (err,tex){ 
                        avatar.spriteFrame = new cc.SpriteFrame(tex); 
                    });
                }

            });
            this.sio.on(this.name+'show',function(msg){//action >2的时候接收不到这个事件
                self.node.getChildByName('prepare').active =false;
                if(this.checksfx){
                    audio.playSFX('readygo.mp3',1);
                }
                for(var i=0;i< msg.length;++i){
                    self._pai[i]= msg[i];
                }
                self._playnode.getChildByName('1').getChildByName('numOfPoke').getComponent(cc.Label).string = msg.length;
                var node1 = self._playnode.getChildByName('1').getChildByName('1');
                self.getSpriteByUrl(node1,msg[0]);
                self._playnode.getChildByName('2').getChildByName('2').active = true;
                if(this._maxnum == 3){
                    self._playnode.getChildByName('3').getChildByName('3').active = true;
                }
            });
        }

            this.sio.on('qiang_pai',function(msg){ // regame 这个时间监听不到
                cc.find('Canvas/qiangpai').active = true;  
                self.luckyBoy = self._seats[msg.index];
                cc.find('Canvas/qiangpai/tip').getComponent(cc.Label).string = '抢牌可以获得额外的牌和优先出牌权';
                self.schedule(function(){
                    cc.find('Canvas/qiangpai/tip').active = false;
                },1);
                if(self._seats[msg.index] == self.name){
                    cc.find('Canvas/qiangpai/qiang_btn').active = true;
                    if(self.coin <1){
                        cc.find('Canvas/qiangpai/qiang_btn/1').getComponent(cc.Button).interactable = false;
                        cc.find('Canvas/qiangpai/qiang_btn/2').getComponent(cc.Button).interactable = false;
                        cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
                    }else if(self.coin <2&&self.coin>=1){
                        
                        cc.find('Canvas/qiangpai/qiang_btn/2').getComponent(cc.Button).interactable = false;
                        cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
                    }else if(self.coin <3&&self.coin>=2){ 
                        cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
                    }
                }
                for(var i=0;i<msg.map.length;++i){
                    self.qiangpai[i] = msg.map[i];
                    var node = cc.find('Canvas/qiangpai/pai').children[i];
                    self.getSpriteByUrl(node,msg.map[i]);
                }
            });
        
       
        this.sio.on('push_qiangpai',function(ret){
            if(ret == self.name){
                for(var i=0;i<self.qiangpai.length;++i){
                    self._pai.push(self.qiangpai[i]);
                    var node =cc.find('Canvas/qiangpai/pai').children[i]
                    var action = cc.moveTo(0.3,cc.v2(40,-180))
                    node.runAction(action)
                }   
                var numofpai = self._pai.length;
                self._playnode.getChildByName('1').getChildByName('numOfPoke').getComponent(cc.Label).string = numofpai;
            }
            self.node.getChildByName('qiangpai').active = false;
            for(var i=0;i<self._maxnum;++i){
                self._playnode.children[i].getChildByName('qiangpai').active =false;
            }
    });

    this.sio.on('qiang_back',function(msg){
        if(msg.nextname == self.name){
            cc.find('Canvas/qiangpai/qiang_btn').active = true;
            if(self.coin <1){
                cc.find('Canvas/qiangpai/qiang_btn/1').getComponent(cc.Button).interactable = false;
                cc.find('Canvas/qiangpai/qiang_btn/2').getComponent(cc.Button).interactable = false;
                cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
            }else if(self.coin <2&&self.coin>=1){
               
                cc.find('Canvas/qiangpai/qiang_btn/2').getComponent(cc.Button).interactable = false;
                cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
            }else if(self.coin <3&&self.coin>=2){
                cc.find('Canvas/qiangpai/qiang_btn/3').getComponent(cc.Button).interactable = false;
            }
        }else{
            cc.find('Canvas/qiangpai/tip').getComponent(cc.Label).string = '玩家'+msg.nextname+'正在抢牌...';
        }
        for(var i=0;i<self._seats.length;++i){
            var findName = self._playnode.children[i].getChildByName('name').getComponent(cc.Label).string;
            if(msg.name == findName){
                if(msg.score >0){
                    self._playnode.children[i].getChildByName('qiangpai').getComponent(cc.Label).string = msg.score+'分';
                }else{
                    self._playnode.children[i].getChildByName('qiangpai').getComponent(cc.Label).string = '不抢牌';
                }        
            }
        }
              
    });
    this.sio.on('update_coin',function(msg){
        if(msg.name == self.name){
            self.node.getChildByName('top').getChildByName('num').getComponent(cc.Label).string = msg.coin;
        }
    });
        
    },

    showView:function(action){
        var self =this;
        if(action == 2){
            var a = self._seats.indexOf(self.lastActionName)
            var index = (a + 1)%self._maxnum
            for(var j = 0;j<self._seats.length;++j){
                self._playnode.children[j].getChildByName('hint').active = false;
            }
            for(var b=0;b<self._pool.length;++b){
                var node2 = cc.find('Canvas/pool').children[b];
                self.getSpriteByUrl(node2,self._pool[b]); 
            }
            if(self.name == self._seats[index]){
                self._playnode.getChildByName('1').getChildByName('1').getComponent(cc.Button).interactable = true ;
                self._playnode.children[0].getChildByName('hint').active = true;
                self._playnode.children[0].getChildByName('hint').getComponent(cc.Label).string = '请出牌...'
            }else{
                for(var i=0;i<self._seats.length;++i){
                    var targetName = self._playnode.children[i].getChildByName('name').getComponent(cc.Label).string;
                    if(self._seats[index] == targetName){
                        self._playnode.children[i].getChildByName('hint').active = true;
                        self._playnode.children[i].getChildByName('hint').getComponent(cc.Label).string = '出牌中...'
                    }
                }
            }
        }else{
            this.sio.on('notify_play',function(msg){
                for(var j = 0;j<self._seats.length;++j){
                    self._playnode.children[j].getChildByName('hint').active = false;
                }
                if(msg == self.name){
                    self._playnode.children[0].getChildByName('hint').active = true;
                    self._playnode.children[0].getChildByName('hint').getComponent(cc.Label).string = '请出牌...'
                }else{
                    for(var i=0;i<self._seats.length;++i){
                        var targetName = self._playnode.children[i].getChildByName('name').getComponent(cc.Label).string;
                        if(msg == targetName){
                            self._playnode.children[i].getChildByName('hint').active = true;
                            self._playnode.children[i].getChildByName('hint').getComponent(cc.Label).string = '出牌中...'
                        }
                    }
                } 
            });
        }

        this.sio.on(this.name+'play',function(msg){ 
            self._playnode.getChildByName('1').getChildByName('1').getComponent(cc.Button).interactable = true ;
        });
      
        this.sio.on('show_view',function(msg){
            if(self.name != msg.name){
                self._pool.push(msg.target);
            }
            var i = self._pool.length;
            var node2 = cc.find('Canvas/pool').children[i-1];
            self.getSpriteByUrl(node2,msg.target); 
            var numofpai = self._pai.length;
            self._playnode.getChildByName('1').getChildByName('numOfPoke').getComponent(cc.Label).string = numofpai;
        });          
        this.sio.on('update_view',function(msg){
            var action =null;
            if(msg.name ==self.name){
                if(this.checksfx){
                    audio.playSFX('yaho.mp3',1);
                }
                for(var j =msg.pool.length;j<self.num;++j){
                    var node = cc.find('Canvas/pool').children[j];
                    var position = node.getPosition();
                    if(self._maxnum == 3){
                        action = cc.moveTo(0.3,cc.v2(40,-180));
                    }else{
                        action = cc.moveTo(0.3,cc.v2(-300,-90));
                    }
                    
                    var action1 = cc.moveTo(0.01,position)
                    var finish = cc.callFunc(function (node){
                        node.getComponent(cc.Sprite).spriteFrame = null;
                    },node);
                    var myaction = cc.sequence(action,finish,action1);
                    node.runAction(myaction); 
                    
                }
            }else{
                for(var i = msg.pool.length;i<self._pool.length;i++){
                    var node1 = cc.find('Canvas/pool').children[i];
                    node1.getComponent(cc.Sprite).spriteFrame = null;
                }
                self._pool.splice(msg.pool.length);
            }
            var numofpai = self._pai.length;
            self._playnode.getChildByName('1').getChildByName('numOfPoke').getComponent(cc.Label).string = numofpai;
                // for(var j= 0;j<msg.pool.length;++j){
                //     var node = cc.find('Canvas/pool').children[j];
                //     self.getSpriteByUrl(node,msg.pool[j]); 
                // }
        });
     
    },

    result:function(){
        var self = this;
        this.sio.on('notify_gameOver',function(msg){
            if(msg == self.name){
                console.log('You lose!');
                self._playnode.getChildByName('1').getChildByName('1').active =false;
                self._playnode.getChildByName('1').getChildByName('hint').active = false;
                if(this.checksfx){
                    audio.playSFX('lose.mp3',1);
                }
            }else{
                console.log(msg+' lose');
            }
            self._seats.splice(self._seats.indexOf(msg),1);
        });

        this.sio.on('allOver',function(msg){
            cc.find('Canvas/gameOver').active = true;
            cc.find('Canvas/gameOver').getChildByName(self._maxnum).active =true;
            for(var i=0;i<msg.seats.length;++i){
                const node = cc.find('Canvas/gameOver').getChildByName(self._maxnum).children[i];
                node.getChildByName('name').getComponent(cc.Label).string = msg.seats[i];
                cc.loader.load(self._img[i],function(err,tex){
                    node.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = new SpriteFrame(tex)
                })
            }
            var index = msg.seats.indexOf(msg.winner);
            cc.find('Canvas/gameOver').getChildByName(self._maxnum).children[index].getChildByName('result').getComponent(cc.Label).string = msg.num+'张';
            self._playnode.getChildByName('1').getChildByName('1').active =false;
            console.log('You win! Good job~');
            if(this.checksfx){
                audio.playSFX('win.mp3',1);
            }
        });
    },

    back_to_hall:function(){
        var data = {
            seats:this._seats,
            name:this.name,
            roomId:this.roomId
        };
        this.sio.emit('dismissroom',data);
        this.sio.emit('disconnect',this.name);
        this.sio.disconnect()
        console.log('close normally')
        this.sio =null
        cc.director.loadScene('hall');
    },


    getUrl:function(url){
        return 'Texture/poke/'+url;
    },
    getSpriteByUrl:function(node,url){
        var url1 = this.getUrl(url);
        cc.loader.loadRes(url1,cc.SpriteFrame,function(err,spriteFrame){
            node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
    },
    update:function(dt) {
        var time = new Date();
        if(this._time != time){
            var time1 = time.getHours();
            time1 = time1 <10? '0'+time1 :time1;
            var time2 = time.getMinutes();
            time2 =time2 <10? '0'+time2 :time2;
            var timeStr = time1+" : "+time2;
            var infotop = this.node.getChildByName('top');
            infotop.getChildByName("time").getComponent(cc.Label).string = timeStr;
        }
       
    },
});