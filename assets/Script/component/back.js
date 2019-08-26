
cc.Class({
    extends: cc.Component,

    properties: {
       backBtn:cc.Button
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },
    back(){
        this.node.active = false;
    },
    backToHall(){
        cc.director.loadScene('hall')
    }
    // update (dt) {},
});
