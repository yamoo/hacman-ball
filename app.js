var io,
    port = 33000,
    //port = 3000,
    utils,
    itemList,
    users,
    items,
    observers,
    maxItemNum = 2,
    hacmanId,
    timerDuration = 2000;

itemList = [{
    type: 'Point',
    frame: 0,
    visible: true,
    abilities: {
        hacman: true
    }
}, {
    type: 'Goal',
    frame: 1,
    visible: true,
    abilities: {
        goal: 0
    }
}];
users = {};
observers = {};
items = {};
pointItem = null;

utils = require('./js/common/utils');
io = require('socket.io').listen(port);

io.sockets.on('connection', function (socket) {

    socket.on('entry', function(userData) {
        var newUser;

        newUser = {
            id: socket.id,
            name: userData.name,
            charaId: userData.charaId,
            speed: userData.speed,
            cpu: userData.cpu,
            score: 0,
            message: '',
            item: {},
            x: userData.x,
            y: userData.y
        };

        users[newUser.id] = newUser;

        socket.emit('accepted', {
            me: newUser,
            users: users,
            items: items,
            hacmanId: hacmanId
        });

        socket.broadcast.emit('joinUser', newUser);
    });

    socket.on('updateUser', function (userData) {
        var target = users[userData.id];

        if (target) {
            utils.update(target.x, userData.x, function(val) {
                target.x = val;
            });
            utils.update(target.y, userData.y, function(val) {
                target.y = val;
            });
            utils.update(target.score, userData.score, function(val) {
                target.score = val;
            });
            utils.update(target.message, userData.message, function(val) {
                target.message = val;
            });

            target.distination = userData.distination;

            if (!utils.isEmpty(userData.item)) {
                target.item = utils.extend(target.item, userData.item);

                if (target.item.hacman) {
                    if (hacmanId && (hacmanId !== target.id) && users[hacmanId]) {
                        users[hacmanId].item.hacman = false;
                        socket.broadcast.emit('updateUser', users[hacmanId]);
                    }
                    hacmanId = target.id;
                } else {
                    if (users[target.id]) {
                        users[target.id].item.hacman = false;
                        socket.broadcast.emit('updateUser', users[target.id]);
                    }

                    if (hacmanId && (hacmanId === target.id)) {
                        hacmanId = null;
                    }
                }
            }
        }

        socket.broadcast.emit('updateUser', userData);
    });

    socket.on('loseUser', function (data) {
        socket.broadcast.emit('loseUser', data);
        observers[data.userId] = users[data.userId];
        delete users[data.userId];
    });

    socket.on('createItem', function (itemData) {
        if (itemData.type === 'Point') {
            pointItem = itemData;
        }

        items[itemData.id] = itemData;
        socket.broadcast.emit('createItem', itemData);
    });

    socket.on('updateItem', function (itemData) {
        var target = items[itemData.id];

        if (target) {
            utils.update(target.x, itemData.x, function(val) {
                target.x = val;
            });
            utils.update(target.y, itemData.y, function(val) {
                target.y = val;
            });
            target.visible = itemData.visible;
            target.distination = itemData.distination;
        }

        socket.broadcast.emit('updateItem', itemData);
    });

    socket.on('removeItem', function (itemId) {
        if (pointItem && (itemId === pointItem.id)) {
            pointItem = null;
        }
        socket.broadcast.emit('removeItem', itemId);
        delete items[itemId];
    });

    socket.on('sendMessage', function (data) {
        if (data.msg === '#reset') {
            io.sockets.emit('system.reset');
        } else {
            socket.broadcast.emit('sendMessage', data);
        }
    });

    socket.on('disconnect', function () {
        var target = users[socket.id],
            observer = observers[socket.id];

        socket.broadcast.emit('leaveUser', socket.id);

        if (target) {
            if (target.item.hacman) {
                pointItem = null;
            }
            delete users[socket.id];
        }

        if (observer) {
            delete observers[socket.id];
        }

        if (socket.id === hacmanId) {
            hacmanId = null;
        }
    });

    socket.emit('connected');
});

setInterval(function() {
    var anyUserId = getAnyUser();


    if (!pointItem) {
        io.sockets.socket(anyUserId).emit('createItem', getPointItem());
    }

/***
    if ((utils.length(items) < maxItemNum) && anyUserId) {
        io.sockets.socket(anyUserId).emit('createItem', getRandomItem());
    }

    if (!pointItem) {
        io.sockets.socket(anyUserId).emit('createItem', getPointItem());
    }
***/
}, timerDuration);


function getPointItem() {
    var item = itemList[0];

    item.id = getUniqueId('point');
    return item;
}

function getRandomItem() {
    var item = itemList[Math.floor(Math.random() * (itemList.length-1))+1];

    item.id = getUniqueId('item');
    return item;
}

function getUniqueId(prefix) {
    return (prefix || '') + new Date().getTime();
}

function getAnyUser() {
    var user;

    for (user in users) {
        break;
    }

    return user;
}


