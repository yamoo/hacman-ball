HAC.define('Hacman',[
    'utils',
    'Const',
    'Item',
    'Comment'
], function(utils, Const, Item, Comment) {
    var Hacman, settings;

    settings = {
        width: 32,
        height: 32,
        speed: 8,
        itemPointSpeed: 20,
        velocity: 4,
        noise: {
            angle: 50,
            speed: 20
        },
        timerDuration: 1000
    };

    Hacman = enchant.Class.create(Item, {
        initialize: function(options){
            Item.call(this, options);

            utils.bind(this, 'onKicked');

            this.cpu = options.cpu;

            this.name = options.name;
            this.speed = options.speed || settings.speed;
            this.charaId = options.charaId;
            this.score = options.score || 0;
            this.item = options.item || {};

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

        move: function(){
            var isMoved = false,
                speed = this.getSpeed(),
                pos = this.getTilePos(),
                dir = '',
                temp;

            temp = {
                x: this.x,
                y: this.y
            };

            if (!this.locked && !this.distination) {
                if (this.game.input.up) {
                    dir += 'U';
                }
                if (this.game.input.down) {
                    dir += 'D';
                }
                if (this.game.input.left) {
                    dir += 'L';
                }
                if (this.game.input.right) {
                    dir += 'R';
                }
            }

            if (dir.indexOf('L') >= 0) {
                if (!this.mapDirTest('left')) {
                    this.x -= speed;
                } else {
                    this.x = pos.x;
                }
                isMoved = true;
            } else if (dir.indexOf('R') >= 0) {
                if (!this.mapDirTest('right')) {
                    this.x += speed;
                } else {
                    this.x = pos.x;
                }
                isMoved = true;
            }
            if (dir.indexOf('U') >= 0) {
                if (!this.mapDirTest('up')) {
                    this.y -= speed;
                } else {
                    this.y = pos.y;
                }
                isMoved = true;
            } else if (dir.indexOf('D') >= 0) {
                if (!this.mapDirTest('down')) {
                    this.y += speed;
                } else {
                    this.y = pos.y;
                }
                isMoved = true;
            }

            if (isMoved) {
                this.prev = temp;
            }

            return isMoved;
        },

        hitTest: function(object) {
            var target = object.chara || object;

            return object.getVisible() ? target.intersect(this.chara) : false;
        },

        getAngle: function() {
            return (this.y - this.prev.y) / (this.x - this.prev.x);
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

        setLabel: function() {
            this.label.text = this.name + ' (' + this.score + ')';
        },

        setScore: function(score) {
            this.score = score;
            this.setLabel();
        },

        getHacman: function() {
            this.hacmanFace.visible = true;
        },

        loseHacman: function() {
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
            _this.setComment();

            if (msg === 'z' && _this.hasAbility('hacman')) {
                _this._shoot();
                this.locked = true;
            }

            clearTimeout(_this.messageTimer);
            _this.messageTimer = setTimeout(function() {
                _this.server.updateUser({
                    id: _this.id,
                    message: _this.message
                });
                _this.message = '';
                _this.locked = false;
            }, _this.messageTimerDuration);
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
            if (data.distination) {
                _this.distination = data.distination;
                _this.addEventListener('enterframe', _this.onKicked);
            }

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
        },

        _shoot: function() {
            var angle,
                yDir,
                dist;

            yDir = (this.y - this.prev.y > 0) ? 1 : -1;
            angle = this.getAngle();
            dist = this.calcDist(yDir, angle, this.getSpeed() * settings.itemPointSpeed);

            this.server.updateItem({
                id: this.item.hacman,
                visible: true,
                x: this.x,
                y: this.y,
                distination: dist
            });

            this.server.updateUser({
                id: this.id,
                item: {
                    hacman: false
                }
            });
        },


    });

    return Hacman;
});