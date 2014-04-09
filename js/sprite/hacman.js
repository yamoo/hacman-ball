HAC.define('Hacman',[
    'utils',
    'Const',
    'Comment'
], function(utils, Const, Comment) {
    var Hacman, settings;

    settings = {
        width: 32,
        height: 32,
        speed: 8,
        kickedSpeed: 16,
        timerDuration: 1000
    };

    Hacman = enchant.Class.create(enchant.Group, {
        initialize: function(options){
            enchant.Group.call(this);

            this.speed = options.speed || settings.speed;
            this.cpu = options.cpu;

            this.game = options.game;
            this.map = options.map;

            this.id = options.id;
            this.name = options.name;
            this.x = options.x || 0;
            this.y = options.y || 0;
            this.prev = {
                x: 0,
                y: 0
            };
            this.charaId = options.charaId;
            this.score = options.score || 0;
            this.item = options.item || {};
            this.isKicked = false;

            this.message = options.message || '';
            this.messageTimer = null;
            this.messageTimerDuration = settings.timerDuration;

            this.hacmanFace = new Sprite(settings.width, settings.height);
            this.hacmanFace.image = this.game.assets[Const.assets['chara0']];
            this.hacmanFace.frame = 0;
            this.hacmanFace.visible = false;

            this.chara = new Sprite(settings.width, settings.height);
            this.chara.id = options.charaId;
            this.chara.image = this.game.assets[Const.assets['chara0']];
            this.chara.frame = this.chara.id;

            this.label = new Label();
            this.label.font = '14px sans-serif';
            this.label.x = this.chara.width;
            this.label.color = options.color || '#fff';

            this.comment = new Comment();
            this.comment.setText(this.message);
            this.comment.x = settings.width/2;
            this.comment.y = settings.height;

            this.update(this);

            this.addChild(this.hacmanFace);
            this.addChild(this.chara);
            this.addChild(this.label);
            this.addChild(this.comment);
            this.setLabel();
        },

        kicked: function(kicker) {
            if (this.y - kicker.y > settings.height/2) {
                this.isKicked = 'down';
            }
            if (kicker.x - this.x > settings.width/2) {
                this.isKicked = 'left';
            }
            if (kicker.y - this.y > settings.height/2) {
                this.isKicked = 'up';
            }
            if (this.x - kicker.x > settings.width/2) {
                this.isKicked = 'right';
            }
        },

        move: function(){
            var isMoved = false,
                speed = this.getSpeed(),
                pos = this.getTilePos(),
                dir,
                temp;

            temp = {
                x: this.x,
                y: this.y
            };

            if (this.isKicked) {
                dir = this.isKicked;
            } else {

                if (this.game.input.up) {
                    dir = 'up';
                }
                if (this.game.input.down) {
                    dir = 'down';
                }
                if (this.game.input.left) {
                    dir = 'left';
                }
                if (this.game.input.right) {
                    dir = 'right';
                }
            }

            if (dir === 'left') {
                if (!this.mapDirTest('left')) {
                    this.x -= speed;
                } else {
                    this.x = pos.x;
                }
                isMoved = true;
            } else if (dir === 'right') {
                if (!this.mapDirTest('right')) {
                    this.x += speed;
                } else {
                    this.x = pos.x;
                }
                isMoved = true;
            }
            if (dir === 'up') {
                if (!this.mapDirTest('up')) {
                    this.y -= speed;
                } else {
                    this.y = pos.y;
                }
                isMoved = true;
            } else if (dir === 'down') {
                if (!this.mapDirTest('down')) {
                    this.y += speed;
                } else {
                    this.y = pos.y;
                }
                isMoved = true;
            }

            if (isMoved) {
                this.prev = temp;
            } else {
                if (this.isKicked) {
                    this.isKicked = false;
                }
            }


            return isMoved;
        },

        hitTest: function(object) {
            var target = object.chara || object;

            return target.intersect(this.chara);
        },

        getAngle: function() {
            return (this.prev.y - this.y) / (this.prev.x - this.x);
        },

        getSpeed: function() {
            var speed = this.item.speed || this.speed;

            if (this.cpu) {
                if (speed > this.speed) {
                    speed = this.speed;
                }
            }

            return speed;
        },

        getTilePos: function() {
            return {
                x: this.map.tileWidth * Math.floor(this.x/this.map.tileWidth),
                y: this.map.tileHeight * Math.floor(this.y/this.map.tileHeight)
            };
        },

        mapDirTest: function(dir) {
            var judge,
                pos = this.getTilePos(),
                speed = this.getSpeed();

            switch(dir) {
                case 'left':
                    judge = this.map.hitTest(this.x-speed, this.y);
                    break;
                case 'right':
                    judge = this.map.hitTest(pos.x+this.chara.width+speed, this.y);
                    break;
                case 'up':
                    judge = this.map.hitTest(this.x, this.y-speed);
                    break;
                case 'down':
                    judge = this.map.hitTest(this.x, pos.y+this.chara.height+speed);
                    break;
            }

            return judge;
        },

        checkRight: function() {
            return !this.map.hitTest(this.x-speed, this.y);
        },

        checkTop: function() {
            return !this.map.hitTest(this.x-speed, this.y);
        },

        setLabel: function() {
            this.label.text = this.name + ' (' + this.score + ')';
        },

        setScore: function(score) {
            this.score = score;
            this.setLabel();
        },

        isHacman: function() {
            return this.hacmanFace.visible;
        },

        getHacman: function() {
            this.isHacman = true;
            this.hacmanFace.visible = true;
        },

        loseHacman: function() {
            this.isHacman = false;
            this.hacmanFace.visible = false;
        },

        getSick: function() {
            this.chara.frame = this.chara.id + Const.charactor.length;
        },

        getHelth: function() {
            this.item.speed = null;
            this.chara.frame = this.chara.id;
        },

        setMessage: function(msg) {
            var _this = this;

            _this.message += msg;
            this.setComment();

            clearTimeout(this.messageTimer);
            this.messageTimer = setTimeout(function() {
                _this.server.updateUser({
                    id: _this.id,
                    message: _this.message
                });
                _this.message = '';
            }, this.messageTimerDuration);
        },

        setComment: function(msg) {
            this.comment.setText(msg || this.message);
        },

        hasAbility: function(ab) {
            return this.item[ab] ? true : false;
        },

        update: function(data) {
            var _this = this;

            utils.update(_this.x, data.x, function(val) {
                _this.x = val;
            });
            utils.update(_this.y, data.y, function(val) {
                _this.y = val;
            });
            utils.update(_this.score, data.score, function(val) {
                _this.setScore(val);
            });
            utils.update(_this.message, data.message, function(val) {
                _this.setComment(val);
            });


            if (!utils.isEmpty(data.item)) {

                _this.item = utils.extend(_this.item, data.item);

                if (_this.hasAbility('hacman')) {
                    _this.getHacman();
                } else {
                    _this.loseHacman();
                }

                if (_this.hasAbility('sick')) {
                    _this.getSick();
                } else {
                    _this.getHelth();
                }
            }
        },

        dead: function() {
            this.removeEventListener('enterframe');
            this.remove();
        }
    });

    return Hacman;
});