HAC.define('Goal',[
    'Const',
    'utils'
], function(Const, utils) {
    var Goal, settings;

    settings = {
        width: Const.world.tile,
        height: Const.world.tile*4
    };

    Goal = enchant.Class.create(enchant.Group, {
        initialize: function(options){
            enchant.Group.call(this);

            this.game = options.game;
            this.map = options.map;

            this.id = options.id || '';
            this.x = options.x || 0;
            this.y = options.y || 0;
            this.width = settings.width;
            this.height = settings.height;

            this.chara = new Sprite(this.width, this.height);

            this.label = new Label();
            this.label.font = '14px sans-serif';
            this.label.x = 0;
            this.label.color = options.color || '#fff';

            this.addChild(this.chara);
            this.addChild(this.label);
        },

        setTeam: function(team) {
            this.id = team.id;
            this.chara.backgroundColor = team.color;
            this.setScore(team.score);
        },

        update: function(data) {
            var _this = this;

            utils.update(_this.score, data.score, function(val) {
                _this.setScore(val);
            });
            utils.update(_this.member, data.member, function(val) {
                _this.member = val;
            });
        },

        setScore: function(val) {
            this.score = val;
            this.label.text = this.score;
        }
    });

    return Goal;
});