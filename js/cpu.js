HAC.define('Cpu',[
    'utils',
    'Const',
    'Comment'
], function(utils, Const, Comment) {
    var Cpu, settings;

    settings = {
    };

    Cpu = enchant.Class.create(enchant.Group, {
        initialize: function(options){
            enchant.Group.call(this);

            this.game = options.game;
            this.map = options.map;
            this.me = options.me;
            this.usersArray = options.usersArray;
            this.itemsArray = options.itemsArray;
            this.prev = {};
            this.bypass = false;
            this.bypassDir = '';
            utils.bind(this, '_onEnterFrame');

            this.addEventListener('enterframe', this._onEnterFrame);
        },

        _onEnterFrame: function() {
            var target;

            if (this.me.hasAbility('hacman')) {
                target = this._getNearestUser();
                if (!target) {
                    target = this._isPointOnMap();
                }
            } else {
                target = this._isPointOnMap();
            }

            if (target) {
                this._moveFor(target);
            }
        },

        _getNearestUser: function() {
            var _this = this,
                nearestUser,
                minDis = 9999;

            utils.each(_this.usersArray, function(user) {
                var dis;

                if (user.id !== _this.me.id) {
                    dis = Math.sqrt(Math.pow(user.x-_this.me.x,2) + Math.pow(user.y-_this.me.y,2));

                    if (minDis > dis) {
                        minDis = dis;
                        nearestUser = user;
                    }
                }
            });

            return nearestUser;
        },

        _isPointOnMap: function() {
            var pointItem;

            utils.each(this.itemsArray, function(item) {
                if (item.type === 'Point') {
                    pointItem = item;
                }
            });

            return pointItem;
        },

        _moveFor: function(target) {
            var dir = this._for(target),

                test = [
                    this.me.mapDirTest(dir[0]),
                    this.me.mapDirTest(dir[1]),
                ],
                input = {};

            if (this.bypass) {
                if (!this.me.mapDirTest(this.bypassDir)) {
                    input[this.bypassDir] = true;
                    this.bypass = false;
                } else {

                    if (!this.me.mapDirTest(this._getInputDir(this.prev))) {
                        input = this.prev;
                    } else {
                        this.bypass = false;
                    }
                }
            } else {
                if (!test[0]) {
                    input[dir[0]] = true;

                } else if (!test[1]) {
                    if ((dir[1] === 'left' && this.prev.right ) ||
                        (dir[1] === 'right' && this.prev.left ) ||
                        (dir[1] === 'up' && this.prev.down ) ||
                        (dir[1] === 'down' && this.prev.up )) {
                        this.bypass = true;
                        this.bypassDir = dir[0];
                    }
                    input[dir[1]] = true;
                } else {
                    this.bypass = true;

                    if (this.prev.up || this.prev.down) {
                        if (!this.me.mapDirTest('left')) {
                            input['left'] = true;
                        } else {
                            input['right'] = true;
                        }

                        if (dir[0] === 'up' || dir[0] === 'down') {
                            this.bypassDir = dir[0];
                        } else {
                            this.bypassDir = dir[1];
                        }
                    } else if (this.prev.left || this.prev.right) {
                        if (!this.me.mapDirTest('up')) {
                            input['up'] = true;
                        } else {
                            input['down'] = true;
                        }
                        if (dir[0] === 'left' || dir[0] === 'right') {
                            this.bypassDir = dir[0];
                        } else {
                            this.bypassDir = dir[1];
                        }
                    }
                }
            }

            if (!utils.isEmpty(input)) {
                this.prev = input;
            }

            this.game.input = input;
        },

        _getInputDir: function(input) {
            var dir;

            utils.each(input, function(val, name) {
                if (val) {
                    dir = name;
                }
            });

            return dir;
        },

        _for: function(target) {
            var dx = (this.me.x - target.x),
                dy = (this.me.y - target.y),
                fx = (dx >= 0) ? 'left' : 'right',
                fy = (dy >= 0) ? 'up' : 'down',
                f;

            if (Math.abs(dx) >= Math.abs(dy)) {
                f = [fx, fy];
            } else {
                f = [fy, fx];
            }

            return f;
        }
    });

    return Cpu;
});