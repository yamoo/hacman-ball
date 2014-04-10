HAC.define('Item',[
    'Const',
    'utils'
], function(Const, utils) {
    var Item, settings;

    settings = {
        width: Const.world.tile,
        height: Const.world.tile,
        velocity: 4,
        noise: {
            angle: 50,
            speed: 50
        }
    };

    Item = enchant.Class.create(enchant.Group, {
        initialize: function(options){
            enchant.Group.call(this);

            utils.bind(this, 'onKicked');

            this.game = options.game;
            this.map = options.map;

            this.id = options.id;
            this.x = options.x || 0;
            this.y = options.y || 0;
            this.width = settings.width;
            this.height = settings.height;

            this.velocity = options.velocity || {x: settings.velocity, y: settings.velocity};
            this.prev = {
                x: 0,
                y: 0
            };

            if (options.type) {
                this.chara = new Sprite(settings.width, settings.height);
                this.chara.image = this.game.assets[Const.assets['item0']];
                this.chara.frame = options.frame || 0;

                this.setVisible(utils.isEmpty(options.visible) ? true : options.visible);

                this.type = options.type;
                this.abilities = options.abilities;

                this.addChild(this.chara);
            }
        },

        onKicked: function() {
            var wall = {},
                velocityX,
                velocityY;

            if (this.distination) {
                velocityX = (this.distination.x - this.x) / this.velocity.x;
                velocityY = (this.distination.y - this.y) / this.velocity.y;

                if (velocityX && velocityY) {

                    if (this.x < this.map.tileWidth) {
                        wall.x = this.map.tileWidth;
                    }

                    if (this.y < this.map.tileHeight) {
                        wall.y = this.map.tileHeight;
                    }

                    if (this.x > (this.map.width - this.map.tileWidth)) {
                        wall.x = this.map.width - this.map.tileWidth;
                    }

                    if (this.y > (this.map.height - this.map.tileHeight)) {
                        wall.y = this.map.height - this.map.tileHeight;
                    }

                    if (wall.x) {
                        if (this.distination.x < wall.x) {
                            this.distination.x = wall.x - (this.distination.x - wall.x);
                        } else {
                            this.distination.x = wall.x + (this.distination.x - wall.x) - this.width * 2;
                        }
                        velocityX = (this.distination.x - this.x) / this.velocity.x;
                    }

                    if (wall.y) {
                        if (this.distination.y < wall.y) {
                            this.distination.y = wall.y - (this.distination.y - wall.y);
                        } else {
                            this.distination.y = wall.y + (this.distination.y - wall.y) - this.height * 2;
                        }
                        velocityY = (this.distination.y - this.y) / this.velocity.y;
                    }

                    this.x += velocityX;
                    this.y += velocityY;

                    this.prev.x = this.x;
                    this.prev.y = this.y;

                    if (Math.abs(velocityX) < 0.01 || Math.abs(velocityY) < 0.01) {
                        this.distination = null;
                        this.removeEventListener('enterframe', this.onKicked);
                    }
                } else {
                    this.distination = null;
                    this.removeEventListener('enterframe', this.onKicked);
                }
            }
        },

        kicked: function(chara) {
            var angle,
                yDir;

            yDir = (this.y - chara.y > 0) ? 1 : -1;
            angle = chara.getAngle();
            this.distination = this.calcDist(yDir, angle, chara.getSpeed());
        },

        calcDist: function(yDir, angle, speed) {
            var dist = {},
                angleX,
                angleY,
                noise;

            if (angle === Infinity || angle === -Infinity) {
                angleX = 0;
                angleY = utils.getSign(angle);
            } else if (angle === 0) {
                angleX = utils.getSign(angle);
                angleY = 0;
            } else {
                if (yDir > 0) {
                    angleX = angle;
                } else {
                    angleX = -angle;
                }
                angleY = angle;
            }

            noise = {
                speed: (Math.random() * settings.noise.speed),
                angle: (Math.random() * settings.noise.angle - settings.noise.angle/2)
            };

            if (angleX === 0) {
                dist.x = this.x + noise.angle;
                dist.y = this.y + angleY * (speed + noise.speed);
            } else if (angleY === 0) {
                dist.x = this.x + angleX * (speed + noise.speed);
                dist.y = this.y + noise.angle;
            } else {
                dist.x = this.x + angleX * (speed + noise.speed);
                dist.y = angleY * (dist.x - this.x) + this.y;
            }
            return dist;
        },

        update: function(data) {
            var _this = this;

            utils.update(_this.x, data.x, function(val) {
                _this.x = val;
            });
            utils.update(_this.y, data.y, function(val) {
                _this.y = val;
            });
            utils.update(_this.getVisible(), data.visible, function(val) {
                _this.setVisible(val);
            });
            if (data.distination) {
                _this.distination = data.distination;
                _this.addEventListener('enterframe', _this.onKicked);
            }
        },

        setVisible: function(val) {
            if (!this.distination) {
                this.chara.visible = val;
            }
        },

        getVisible: function() {
            return this.chara.visible;
        },

        hitTest: function(object) {
            var target = object.chara || object,
                isVisble = object.getVisible ? object.getVisible() : true;

            return isVisble ? target.intersect(this.chara) : false;
        }
    });

    return Item;
});