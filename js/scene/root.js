HAC.define('rootScene',[
    'Const',
    'utils',
    'BaseMap',
    'Hacman'
], function(utils, Const) {
    var rootScene;

    rootScene = enchant.Class.create(enchant.Scene, {
        initialize: function(options){
            enchant.Scene.call(this);

            this.game = options.game;
            this.map = new BaseMap(this.game);
            this.users = new Group();

        me = _createUser(myUserId);
        scene.addChild(map);
        scene.addChild(users);


        utils.each(userTable, function(userAttr, userId) {
            var user;

            if (userId !== myUserId) {
                user = _createUser(userId);
                user.x = userAttr.x;
                user.y = userAttr.y;
            }
        });

        users.addEventListener('enterframe', function() {
            me.move();
            server.emit('move', {
                userId: myUserId,
                x: me.x,
                y: me.y
            });
        });



    });

    return rootScene;
});




HAC.main([
    'Const',
    'utils',
    'BaseMap',
    'Hacman'
], function(Const, utils, BaseMap, Hacman) {
    enchant();

    var game,
        map,
        me,
        myUserId,
        users,
        userTable,
        server,
        _init,
        _main,
        _createUser;

    _init = function() {
        game = new Game(Const.world.width, Const.world.height);
        game.preload.apply(game, utils.object2Array(Const.assets));
        game.onload = _main;
        game.fps = 30;
        game.scale = 1;

        userTable = {};
        server = utils.server();

        server.on('accept', function (data) {
            myUserId = data.userId;
            userTable = data.users;

            server.on('join', function (userId) {
                _createUser(userId);
            });

            server.on('leave', function (userId) {
                _removeUser(userId);
            });

            server.on('move', function (data) {
                var user;

                user = _getUser(data.userId);
                user.x = data.x;
                user.y = data.y;
            });

            game.start();
        });
    };

    _main = function() {
        var scene;

        scene = new Scene();
        map = new BaseMap(game);
        users = new Group();

        me = _createUser(myUserId);
        scene.addChild(map);
        scene.addChild(users);
        scene.addChild(label);
        game.pushScene(scene);

        utils.each(userTable, function(userAttr, userId) {
            var user;

            if (userId !== myUserId) {
                user = _createUser(userId);
                user.x = userAttr.x;
                user.y = userAttr.y;
            }
        });

        users.addEventListener('enterframe', function() {
            me.move();
            server.emit('move', {
                userId: myUserId,
                x: me.x,
                y: me.y
            });
        });
    };

    _createUser = function(userId) {
        var user;

        user = new Hacman({
            map: map,
            game: game
        });

        userTable[userId] = user;
        users.addChild(user);

        return user;
    };

    _removeUser = function(userId) {
        var user;

        user = _getUser(userId);
        users.removeChild(user);
    };

    _getUser = function(userId) {
        return userTable[userId];
    };

    _init();
});