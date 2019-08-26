var http  = require('../Http')
cc.Class({
    extends: cc.Component,

    properties: {
        _splash:null,
        _isLoading:null,
        version:1.00,
        loadingProgess:cc.Label,
        train:cc.Node,
        _stateStr:'',
        _progress:null,
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        this. loadingProgess.string = this._stateStr;
        console.log('haha');
        // this.showSplash(function(){ 
        this.showSplash()
        // })
    },
    
    showSplash:function(callback){
        var self = this;
        var SHOW_TIME = 3000;
        // if(this._splash.getComponent(cc.Sprite).spriteFrame == null){
        //     callback();
        //     return;
        // }
        var action = cc.moveTo(0.5,cc.v2(0,50))
        self.train.runAction(action)
        self.loadingProgess.string = '哈！哈！火车头'
        var t = Date.now();
        var fn = function(){
            var dt = Date.now() - t;
            if(dt < SHOW_TIME){
                setTimeout(fn,33);
            }
            else {
                self.getServerInfo(); 
            }
        };
        setTimeout(fn,33);
        
    },
    
    getServerInfo:function(){
        var self = this;
        console.log('iii')
        var onGetVersion = function(ret){
            if(ret.version == null){
                console.log("error.");
            }
            else{
                if(ret.version == self.version){
                    self.startPreloading();
                }
            }
        };
        
        var xhr = null;
        var complete = false;
        var fnRequest = function(){
            self.loadingProgess.string = "正在连接服务器..."; 
            xhr = http.Request("/get_serverinfo",null,function(ret){
                var ret1 = JSON.parse(ret)
                xhr = null;
                complete = true;
                onGetVersion(ret1);
            },3000);
            setTimeout(fn,5000); 
        }
        
        var fn = function(){
            if(!complete){
                if(xhr){
                    xhr.abort();
                    self.loadingProgess.string = "连接失败，即将重试";
                    setTimeout(function(){
                        fnRequest();
                    },5000);
                }
                else{
                    fnRequest();
                }
            }
        }
        fn()
    },
    startPreloading:function(){
        this._stateStr = "正在加载资源，请稍候"
        this._isLoading = true;
        var self = this;
        
        cc.loader.onProgress = function ( completedCount, totalCount,  item ){
            console.log("completedCount:" + completedCount + ",totalCount:" + totalCount );
            if(self._isLoading){
                self._progress = completedCount/totalCount;
            }
        };
        cc.loader.loadResDir("resources", function (err, assets) {
            self.onLoadComplete();
        });
        
        // cc.loader.loadResDir("sounds", function (err, assets) {
            
        // });      
    },
    
    onLoadComplete:function(){
        this._isLoading = false;
        this._stateStr = "准备登陆";
        cc.director.loadScene("login");
        cc.loader.onComplete = null;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this._stateStr.length == 0){
            return;
        }
        this. loadingProgess.string = this._stateStr + ' ';
        if(this._isLoading){
            this. loadingProgess.string += Math.floor(this._progress * 100) + "%";   
        }
        else{
            var t = Math.floor(Date.now() / 1000) % 4;
            for(var i = 0; i < t; ++ i){
                this. loadingProgess.string += '.';
            }            
        }
    }
});
