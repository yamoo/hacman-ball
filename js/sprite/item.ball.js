HAC.define('Ball',[
    'utils',
    'Const',
    'Item'
], function(utils, Const, Item) {
    var Ball, settings;

    settings = {
        velocity: 4,
        width: 32,
        height: 32,
        noise: {
            angle: 20,
            speed: 200
        }
    };

    Ball = enchant.Class.create(Item, {
        initialize: function(options){
            Item.call(this, options);

            this.velocity = options.velocity || settings.velocity;
            this.wall = null;
            this.prev = {
                x: null,
                y: null
            };
            this.distination = null;
            this.velocity = {
                x: settings.velocity,
                y: settings.velocity
            };

            utils.bind(this, '_onEnterFrame');
            this.addEventListener('enterframe', this._onEnterFrame);
        },

        _onEnterFrame: function() {
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
                            this.distination.x = wall.x - (this.distination.x - wall.x) - this.width;
                        }
                        velocityX = (this.distination.x - this.x) / this.velocity.x;
                    }

                    if (wall.y) {
                        if (this.distination.y < wall.y) {
                            this.distination.y = wall.y - (this.distination.y - wall.y);
                        } else {
                            this.distination.y = wall.y + (this.distination.y - wall.y) - this.height;
                        }
                        velocityY = (this.distination.y - this.y) / this.velocity.y;
                    }

                    this.x += velocityX;
                    this.y += velocityY;

                    this.prev.x = this.x;
                    this.prev.y = this.y;
                }
            }
        },

        kicked: function(chara) {
            var angle,
                dist;

            angle = chara.getAngle();
            this.distination = this.calcDist(angle, chara.getSpeed());
        },

        calcDist: function(angle, speed) {
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
                angleX = angle;
                angleY = angle;
            }

            noise = {
                speed: -(Math.random() * settings.noise.speed),
                angle: (Math.random() * settings.noise.angle - settings.noise.angle/2)
            };

            if (angleX === 0) {
                dist.x = this.x + noise.angle;
                dist.y = this.y + utils.getSign(angleY) * (speed + noise.speed);
            } else if (angleY === 0) {
                dist.x = this.x + utils.getSign(angleX) * (speed + noise.speed);
                dist.y = this.y + noise.angle;
            } else {
                dist.x = this.x + utils.getSign(angleX) * (speed + noise.speed);
                dist.y = angleY * noise.angle * (dist.x - this.x) + this.y;
            }

            return dist;
        }
    });

    return Ball;
});