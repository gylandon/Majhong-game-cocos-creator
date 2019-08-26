

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        target:cc.Node,
        target1:cc.Node,
        sprite:cc.SpriteFrame,
        checkedSprite:cc.SpriteFrame,
        checked:false,
        radioBtn:cc.Node
    },

    // use this for initialization
    onLoad: function () {
    },
    
    refresh:function(){
        var targetSprite = this.target.getComponent(cc.Sprite);
        var targetSprite1 = this.target1.getComponent(cc.Sprite);
        if(this.checked){
            targetSprite.spriteFrame = this.checkedSprite;
            targetSprite1.spriteFrame = this.sprite;
            this.radioBtn.getComponent('radio').checked= false;
        }
        else{
            targetSprite.spriteFrame = this.sprite;
            targetSprite1.spriteFrame = this.checkedSprite;
            this.radioBtn.getComponent('radio').checked = true;
        }
    },
    
    onClicked:function(){
       this.checked = !this.checked
       this.refresh();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    
});
