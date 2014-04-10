HAC.define('GameMain', [
    'Const',
    'utils',
    'BaseMap',
    'Hacman',
    'Item',
    'ItemPoint',
    'Goal',
    'End',
    'Cpu'
], function(Const, utils, BaseMap, Hacman, Item, ItemPoint, Goal, End, Cpu) {
    var GameMain;

    GameMain = function(server) {
        enchant();

        this.server = server;
        this._init();
    };

    GameMain.prototype._init = function() {
        var _this = this;

        _this.game = new Game(Const.world.width, Const.world.height);
        _this.game.preload.apply(_this.game, utils.object2Array(Const.assets));
        _this.game.onload = function() {
            _this._initWorld.apply(_this);
            _this.onLoadGame();
        };
        _this.game.fps = 30;
        _this.game.scale = 1;
    };

    GameMain.prototype._initWorld = function() {
        this.isTimeout = false;
        this.usersArray = {};
        this.observersArray = {};
        this.itemsArray = {};
        this.pointItem = null;
        this.rootScene = new Scene();
        this.map = new BaseMap(this.game);
        this.usersLayer = new Group();
        this.itemsLayer = new Group();

        //Init goal
        this.goalsArray = [
            new Goal({
                x: this.map.width-Const.world.tile*2,
                y: Const.world.tile*7
            }),
            new Goal({
                x: Const.world.tile,
                y: Const.world.tile*7
            })
        ];

        this.rootScene.addChild(this.map);
        this.rootScene.addChild(this.goalsArray[0]);
        this.rootScene.addChild(this.goalsArray[1]);
        this.rootScene.addChild(this.itemsLayer);
        this.rootScene.addChild(this.usersLayer);
        this.game.pushScene(this.rootScene);
    };

    GameMain.prototype._main = function() {
        var _this = this;

        utils.bind(
            _this,
            '_onKeyPress',
            '_onEnterFrame',
            '_onJoinUser',
            '_onUpdateUser',
            '_onLoseUser',
            '_onLeaveUser',
            '_onCreateItem',
            '_onUpdateItem',
            '_onRemoveItem',
            '_onUpdateTeam',
            '_onTimeout'
        );

        _this.hacmanId = _this.server.data.hacmanId;
        _this.lastHacmanId = _this.server.data.lastHacmanId;
        _this.teamsArray = _this.server.data.teams;

        _this.me = _this._onJoinUser(_this.server.data.me);
        _this.me.server = _this.server;
        _this.me.label.color = '#ff0';

        //Init team
        _this.goalsArray[0].setTeam(_this.teamsArray['team0']);
        _this.goalsArray[1].setTeam(_this.teamsArray['team1']);

        //Init users
        utils.each(_this.server.data.users, function(userData) {
            var user;

            if (userData.id !== _this.server.data.me.id) {
                _this._createUser(userData);
            }
        });

        //Init items
        utils.each(_this.server.data.items, function(itemData) {
            _this._createItem(itemData);
        });

        //keybind
        document.addEventListener('keypress', _this._onKeyPress);

        //Update my chara
        _this.me.addEventListener('enterframe', _this._onEnterFrame);

        //The other user joind
        _this.server.on('joinUser', _this._onJoinUser);

        //The other user updated
        _this.server.on('updateUser', _this._onUpdateUser);

        //The other user lose
        _this.server.on('loseUser', _this._onLoseUser);

        //The other user left
        _this.server.on('leaveUser', _this._onLeaveUser);

        //The item created by timer
        _this.server.on('createItem', _this._onCreateItem);

        //The item update
        _this.server.on('updateItem', _this._onUpdateItem);

        //The item was gotten by someone
        _this.server.on('removeItem', _this._onRemoveItem);

        //The item team
        _this.server.on('updateTeam', _this._onUpdateTeam);

    };

    GameMain.prototype._onKeyPress = function(e) {
        var chr = String.fromCharCode(e.which);

        this.me.setMessage(chr);
    };

    GameMain.prototype._onEnterFrame = function() {
        var hacmanUser,
            gotItem,
            gotGoal,
            hitUser,
            itemAbilities = null,
            isKilled;

        //hacmanUser = this._getUserData(this.hacmanId);
        gotGoal = (function(_this) {
            var lastHacmanUser = _this._getUserData(_this.lastHacmanId);

            if (_this.pointItem && lastHacmanUser) {
                if (_this.pointItem.hitTest(_this.goalsArray[0]) && (lastHacmanUser.team.id !== _this.goalsArray[0].id)) {
                    return _this.goalsArray[0];
                } else if (_this.pointItem.hitTest(_this.goalsArray[1]) && (lastHacmanUser.team.id !== _this.goalsArray[1].id)) {
                    return _this.goalsArray[1];
                }
            }
        })(this);
        //isKilled = (hacmanUser && !utils.isEqual(this.hacmanId, this.me.id) && this.me.hitTest(hacmanUser)) ? true : false;

        if (isKilled) {
            this._killedUser();
            this._sound('kill');
        } else if (gotGoal) {
            this._goalUser(gotGoal);
            this._sound('point');
        } else {
            if (this.me.move()) {
                //this._sound('walk');
                gotItem = this._itemHitTest();

                if (gotItem) {
                    itemAbilities = gotItem.abilities;

                    if (gotItem.type === 'Point') {
                        itemAbilities.hacman = gotItem.id;

                        this.server.updateItem({
                            id: gotItem.id,
                            visible: false
                        });
                    } else {
                        this.server.removeItem(gotItem.id);

                        if (gotItem.type === 'Devil') {
                            this._sound('sick');
                        } else {
                            this._sound('item');
                        }
                    }
                }

                if (!this.me.hasAbility('hacman')) {
                    hitUser = this._userHitTest();

                    if (hitUser) {
                        if (hitUser.hasAbility('hacman')) {
                            itemAbilities = {
                                hacman: hitUser.item.hacman
                            };
                        } else {
                            this._sound('end');
                        }
                    }
                }

                this.server.updateUser({
                    id: this.me.id,
                    x: this.me.x,
                    y: this.me.y,
                    item: itemAbilities
                });

                this.isTimeout = false;
            }
        }

        if (hitUser) {
            this._sound('kick');
            hitUser.kicked(this.me);

            this.server.updateUser({
                id: hitUser.id,
                distination: hitUser.distination
            });
        }
    };

    GameMain.prototype._onCreateItem = function(itemData) {
        this._createItem(itemData);
    };

    GameMain.prototype._onUpdateItem = function(itemData) {
        var target = this._getItemData(itemData.id);

        if (target) {
            target.update(itemData);
        }
    };

    GameMain.prototype._onRemoveItem = function(itemId) {
        this._removeItem(itemId);
    };

    GameMain.prototype._onJoinUser = function(userData) {
        var user;

        user = this._createUser(userData);
        this.showMessage(utils.template(Const.message.user.join, {
            targetName: userData.name
        }), 'join');

        return user;
    };

    GameMain.prototype._onUpdateUser = function(userData) {
        var target = this._getUserData(userData.id);

        if (target) {
            target.update(userData);

            if (target.hasAbility('hacman')) {
                this._setHacmanId(target.id);
            } else {
                if (this.hacmanId === target.id) {
                    this._setHacmanId(null);
                    this.server.updateUser({
                        id: target.id,
                        item: {
                            hacman: false
                        }
                    });
                }
            }
        }
    };

    GameMain.prototype._onLoseUser = function(data) {
        var target = this._getUserData(data.userId),
            killer = this._getUserData(data.killerId) || {name: 'unknown'};

        if (target) {
            this.showMessage(utils.template(Const.message.user.lose, {
                targetName: target.name,
                killerName: killer.name
            }), 'killed');
        }
        this._removeUser(data.userId);
    };

    GameMain.prototype._onLeaveUser = function(userId) {
        var target = this._getUserData(userId),
            observer = this._getObserverData(userId),
            targetName;

        if (target || observer) {
            if (target) {
                targetName = target.name;
                this._removeUser(userId);
            }

            if (observer) {
                targetName = observer.name;
                delete this.observersArray[userId];
            }

            if (userId === this.hacmanId) {
                this._setHacmanId(null);
            }

            this.showMessage(utils.template(Const.message.user.leave, {
                targetName: targetName
            }), 'leave');
        }
    };

    GameMain.prototype._onUpdateTeam = function(teamData) {
        var target = this._getGoalData(teamData.id);

        this.teamsArray[teamData.id] = utils.extend(this.teamsArray[teamData.id], teamData);
        if (target) {
            target.update(teamData);
        }
    };

    GameMain.prototype._onTimeout = function() {
        if (this.isTimeout) {
            location.reload();
        } else {
            this.isTimeout = true;
        }
    };

    GameMain.prototype._setHacmanId = function(id) {
        this.lastHacmanId = this.hacmanId;
        this.hacmanId = id;
    };

    GameMain.prototype._createItem = function(itemData) {
        var item, ItemClass;

        ItemClass = Item;

        item = new ItemClass({
            id: itemData.id,
            x: itemData.x,
            y: itemData.y,
            type: itemData.type,
            frame: itemData.frame,
            abilities: itemData.abilities,
            visible: itemData.visible,
            game: this.game,
            map: this.map
        });

        this._setItemData(item.id, item);
        this.itemsLayer.addChild(item);

        if (itemData.type === 'Point') {
            this.pointItem = item;
        }

        return item;
    };

    GameMain.prototype._removeItem = function(itemId) {
        var item;

        item = this._getItemData(itemId);
        if (item) {
            this.itemsLayer.removeChild(item);
            delete this.itemsArray[itemId];

            if (itemId === this.pointItem.id) {
                this.pointItem = null;
            }
        }
    };

    GameMain.prototype._itemHitTest = function() {
        var _this = this,
            gotItem;

        utils.each(_this.itemsArray, function(item) {
            if (_this.me.hitTest(item)) {
                gotItem = item;
            }
        });

        return gotItem;
    };

    GameMain.prototype._userHitTest = function() {
        var _this = this,
            hitUser;

        utils.each(_this.usersArray, function(user) {
            if (user.id !== _this.me.id && _this.me.hitTest(user)) {
                hitUser = user;
            }
        });

        return hitUser;
    };


    GameMain.prototype._getItemData = function(itemId) {
        return this.itemsArray[itemId];
    };

    GameMain.prototype._setItemData = function(itemId, itemObject) {
        this.itemsArray[itemId] = itemObject;
    };

    GameMain.prototype._createUser = function(userData) {
        var user,
            initPos;

        user = new Hacman({
            id: userData.id,
            name: userData.name,
            charaId: userData.charaId,
            cpu: userData.cpu,
            speed: userData.speed,
            score: userData.score || 0,
            message: userData.message || '',
            item: userData.item || {},
            team: userData.team || {},
            x: userData.x,
            y: userData.y,
            map: this.map,
            game: this.game
        });

        this._setUserData(userData.id, user);
        this.usersLayer.addChild(user);

        return user;
    };

    GameMain.prototype._removeUser = function(userId) {
        var user;

        user = this._getUserData(userId);
        if (user) {
            this.usersLayer.removeChild(user);
            this.observersArray[userId] = this.usersArray[userId];
            delete this.usersArray[userId];
        }
    };

    GameMain.prototype._getUserData = function(userId) {
        return this.usersArray[userId];
    };

    GameMain.prototype._getObserverData = function(userId) {
        return this.observersArray[userId];
    };

    GameMain.prototype._setUserData = function(userId, userObject) {
        this.usersArray[userId] = userObject;
    };

    GameMain.prototype._killedUser = function() {
        var hacmanUser = this._getUserData(this.hacmanId);

        this.me.dead();

        this.server.updateUser({
            id: this.hacmanId,
            score: hacmanUser.score+1
        });

        this.server.loseUser({
            userId: this.me.id,
            killerId: this.hacmanId
        });

        this._gameOver();
    };

    GameMain.prototype._goalUser = function(goal) {
        var lastHacmanUser = this._getUserData(this.lastHacmanId);

        this.server.updateUser({
            id: this.lastHacmanId,
            score: lastHacmanUser.score+1
        });

        this.server.updateTeam({
            id: goal.id,
            score: goal.score+1
        });

        this.server.removeItem(this.pointItem.id);
    };

    GameMain.prototype._getGoalData = function(teamId) {
        var target;

        utils.each(this.goalsArray, function(goal) {
            if (goal.id === teamId) {
                target = goal;
            }
        });
        return target;
    };

    GameMain.prototype._sound = function(name) {
        this.game.assets[Const.assets['snd_'+name]].play();
    };

    GameMain.prototype._gameOver = function() {
        this.rootScene.addChild(new End({
            game: this.game
        }));
        this._sound('end');

        if (this.settings.cpu) {
            location.reload();
        }
    };

    GameMain.prototype.loadGame = function() {
        this.game.start();
    };

    GameMain.prototype.onLoadGame = function() {
        //for override
    };

    GameMain.prototype.startGame = function(options) {
        this.settings = options || {};
        this._main();

        if (options.cpu) {
            this.usersLayer.addChild(new Cpu({
                map: this.map,
                game: this.game,
                usersArray: this.usersArray,
                itemsArray: this.itemsArray,
                me: this.me
            }));
        } else {
            //timeout management
            setInterval(this._onTimeout, Const.timeout);
        }
    };

    GameMain.prototype.getRandomPos = function() {
        var pos;

        pos = {x: 0, y: 0};

        while(1) {
            pos.x = Math.floor(Math.random()*(this.map.width/this.map.tileWidth))*this.map.tileWidth;
            pos.y = Math.floor(Math.random()*(this.map.height/this.map.tileHeight))*this.map.tileHeight;
            if (!this.map.hitTest(pos.x, pos.y)) {
                break;
            }
        }

        return pos;
    };

    GameMain.prototype.showMessage = function() {
        //for override
    };

    return GameMain;
});