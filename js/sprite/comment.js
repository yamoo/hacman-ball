HAC.define('Comment',[
    'utils',
    'Const'
], function(utils, Const) {
    var Comment, settings;

    settings = {
        lineHeight: 20,
        fontSize: 14
    };

    Comment = enchant.Class.create(enchant.Group, {
        initialize: function(options){
            enchant.Group.call(this);

            this.bg = new Sprite();
            this.bg.backgroundColor = 'rgba(255,255,255,0.7)';
            this.bg.height = settings.lineHeight;

            this.label = new Label();
            this.label.font = settings.fontSize + 'px sans-serif';
            this.label.color = '#000';
            this.label.x = settings.lineHeight/2 - settings.fontSize/2;
            this.label.y = this.label.x;

            this.addChild(this.bg);
            this.addChild(this.label);
        },

        setText: function(text) {
            this.label.text = text;
            this.bg.width = this.label.text.length * settings.fontSize/2;
            if (this.label.text.length) {
                this.bg.width += 5;
            }
        },

        getText: function() {
            return this.label.text;
        }
    });

    return Comment;
});