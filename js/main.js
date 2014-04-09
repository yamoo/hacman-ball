HAC.main([
    'Const',
    'utils',
    'Server',
    'GameMain'
], function(Const, utils, Server, GameMain) {
    var server,
        gameMain,
        isCPUMode = false,
        $signin,
        $nickname;

    function _init () {
        var storage;

        if (_isIE()) {
            utils.message(Const.message.error.ie);
            location.href = Const.link.redirect;
        } else {
            $signin = utils.$('#signin');
            $nickname = utils.$('#signin-nickname');

            $signin.addEventListener('submit', _onSubmit);

            storage = _loadData();

            if (storage) {
                $nickname.value = storage.nickname;
                utils.$('[name="signin-chara[]"][value="'+storage.charaId+'"]').checked = true;
            }

            if (_checkMode(Const.mode.secret)) {
                utils.each(utils.$('.chara-hidden'), function($el) {
                    $el.style.visibility = 'visible';
                });
            }

            if (_checkMode(Const.mode.cpu)) {
                isCPUMode = true;
                $nickname.value = 'CPU';
                utils.$('[name="signin-chara[]"][value="15"]').checked = true;
                _onSubmit();
            }
        }
    }

    function _onSubmit(e) {
        var nickname,
            charaId;

        if (e) {
            e.preventDefault();            
        }

        nickname = $nickname.value;
        charaId = utils.$('[name="signin-chara[]"]:checked').value - 0;

        _saveData({
            nickname: nickname,
            charaId: charaId
        });

        server = new Server();
        gameMain = new GameMain(server);
        server.gameMain = gameMain;

        server.on('connected', function(data) {
            gameMain.loadGame();
        });

        gameMain.showMessage = function(msg, status) {
            _showMessage(msg, status);
        };

        gameMain.onLoadGame = function() {
            var initPos,
                entryData;
            initPos = gameMain.getRandomPos();
            entryData = {
                name: nickname,
                charaId: charaId,
                x: initPos.x,
                y: initPos.y
            };

            if (isCPUMode) {
                entryData.cpu = true;
                entryData.speed = 4;
            }

            server.entry(entryData);
        };

        server.on('accepted', function(data) {
            gameMain.startGame({
                cpu: isCPUMode
            });

            utils.$('#ui-signin').remove();
            utils.$('#ui-chat').style.display = 'block';
        });

        server.on('sendMessage', function(data) {
            _showMessage(data);
        });

        if (nickname) {
            server.connect();
        }
    }

    function _loadData() {
        var data;

        data = localStorage.getItem(Const.storage);
        if (data) {
            return JSON.parse(data);
        }
    }

    function _saveData(data) {
        localStorage.setItem(Const.storage, JSON.stringify(data));
    }

    function _isIE() {
        var isIE;

        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
            isIE = true;
        }

        return isIE;
    }

    function _checkMode(query) {
        var isQuery;

        if (new RegExp('mode='+query).test(location.search)) {
            isQuery = true;
        }

        return isQuery;
    }

    function _getMessageHead(msg, status) {
        return {
            msg: msg,
            status: status || ''
        };
    }

    function _showMessage(msg, status) {
        var temp,
            data,
            $item,
            $container;

        data = _getMessageHead(msg, status);
        temp = utils.$('#ui-chat-item').innerHTML;
        $container = utils.$('#ui-chat-list');
        $item = document.createElement('div');
        $item.innerHTML = utils.template(temp, data);
        $container.insertBefore($item.children[0], $container.firstChild);
    }

    function _sendMessage(msg) {
        var data;

        data = _getMessageHead(msg);
        server.sendMessage(data);
    }

    window.HAC.reset = function() {
        _sendMessage('#reset');
    };

    _init();
});