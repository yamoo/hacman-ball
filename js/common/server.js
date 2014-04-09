HAC.define('Server',[
    'Const',
    'utils'
], function(Const, utils) {
    var Server;

    Server = function() {
        this._init();
    };

    Server.prototype._init = function() {
        this.socket = null;
        this.data = null;
        this.events = {};
    };

    Server.prototype.connect = function() {
        var _this = this;

        if (window.io) {
            _this.socket = io.connect(Const.server);

            _this.socket.on('connected', function() {
                _this._onConnected();
            });

            _this.socket.on('accepted', function(data) {
                _this.data = data;
                _this._onAccepted(data);
            });
        }

        return _this.socket;
    };

    Server.prototype.entry = function(options) {
        this.socket.emit('entry', options);
    };

    Server.prototype._onConnected = function(options) {
        this.trigger('connected');
    };

    Server.prototype._onAccepted = function(data) {
        var _this = this;

        _this.socket.on('joinUser', function (userData) {
            _this.trigger('joinUser', userData);
        });

        _this.socket.on('updateUser', function (userData) {
            _this.trigger('updateUser', userData);
        });

        _this.socket.on('loseUser', function (data) {
            _this.trigger('loseUser', data);
        });

        _this.socket.on('leaveUser', function (userId) {
            _this.trigger('leaveUser', userId);
        });

        _this.socket.on('createItem', function (itemData) {
            var pos;

            if (!itemData.x) {
                pos = _this.gameMain.getRandomPos();
                itemData.x = pos.x;
                itemData.y = pos.y;
                _this.socket.emit('createItem', itemData);
            }

            _this.trigger('createItem', itemData);
        });

        _this.socket.on('updateItem', function (itemData) {
            _this.trigger('upateItem', itemData);
        });

        _this.socket.on('removeItem', function (itemId) {
            _this.trigger('removeItem', itemId);
        });

        _this.socket.on('sendMessage', function (data) {
            _this.trigger('sendMessage', data);
        });

        _this.socket.on('system.reset', function () {
            location.reload(true);
        });

        _this.trigger('accepted', data);
    };

    Server.prototype.updateItem = function(itemData) {
        this.socket.emit('updateItem', itemData);
        this.trigger('updateItem', itemData);
    };

    Server.prototype.removeItem = function(itemId) {
        this.socket.emit('removeItem', itemId);
        this.trigger('removeItem', itemId);
    };

    Server.prototype.updateUser = function(userData) {
        this.socket.emit('updateUser', userData);
        this.trigger('updateUser', userData);
    };

    Server.prototype.loseUser = function(userId) {
        this.socket.emit('loseUser', userId);
        this.trigger('loseUser', userId);
    };

    Server.prototype.sendMessage = function(data) {
        this.socket.emit('sendMessage', data);
    };

    Server.prototype.on = function(eventName, handler) {
        if (this.events[eventName]) {
            this.events[eventName].push(handler);
        } else {
            this.events[eventName] = [handler];
        }
    };

    Server.prototype.trigger = function(eventName, args) {
        var _this = this;

        utils.each(_this.events[eventName], function(handler) {
            handler.apply(_this, [args]);
        });
    };

    return Server;
});