HAC.define('End',[
    'utils',
    'Const'
], function(utils, Const) {
    var Point, settings;

    settings = {
        width: 190,
        height: 150
    };

    Point = enchant.Class.create(enchant.Sprite, {
        initialize: function(options){
            enchant.Sprite.call(this);

            this.game = options.game;

            this.width = settings.width;
            this.height = settings.height;
            this.x = Math.floor(Const.world.width/2 - this.width/2);
            this.y = Math.floor(Const.world.height/2 - this.height/2);

            this.image = this.game.assets[Const.assets['end']];
            this.frame = 0;
        }
    });

    return Point;
});