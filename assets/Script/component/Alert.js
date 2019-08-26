cc.Class({
    extends:cc.Component,
    onLoad:function(){  
    },

    btn_ok(){
        cc.find('Canvas/Alert').active = false
        cc.director.loadScene('game')
    },   
    btn_cancel(){
        cc.find('Canvas/Alert').active = false
    },
    btn_ok_login(){
        cc.find('Canvas/Alert').active = false
        cc.director.loadScene('login')
    }
})
var p =  {
    show(title,content,btn_cancel,btn_ok){
        var node = cc.find('Canvas/Alert')
        node.active = true
        var str = node.getChildByName("title").getComponent(cc.Label)
        var str1 = node.getChildByName("content").getComponent(cc.Label)
        node.getChildByName("btn_cancel").active = btn_cancel
        node.getChildByName("btn_ok").active = btn_ok
        str.string =title
        str1.string = content
        if(!btn_cancel){
            node.getChildByName('btn_ok').x = 0
        }
        if(!btn_ok){
            node.getChildByName('btn_cancel').x = 0
        }
    },
    show1:function(title,content){
        var node = cc.find('Canvas/Alert')
        node.active = true
        var str = node.getChildByName("title").getComponent(cc.Label)
        var str1 = node.getChildByName("content").getComponent(cc.Label)
        var str2 = node.getChildByName("btn_ok").getChildByName('1').getComponent(cc.Label)
        node.getChildByName("btn_cancel").active = false
        node.getChildByName("btn_ok").active = true
        str.string =title
        str1.string = content
        str2.string = '返回授权'
 
        node.getChildByName('btn_ok').x = 0
        
        
    }
}
module.exports = p