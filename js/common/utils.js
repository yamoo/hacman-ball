(function() {
    return (typeof window === 'undefined') ? require('./hac') : window.HAC;
})().define('utils',[
], function() {
    var each,
        length,
        object2Array,
        readMap,
        message,
        bind,
        extend,
        template,
        isEqual,
        isEmpty,
        getSign,
        $,
        exp;

    each = function(arg, callback) {
        var i;

        if (arg) {
            if (arg instanceof Object) {
                for (i in arg) {
                    if (arg.hasOwnProperty(i) && i !== 'length') {
                        callback.apply(arg[i], [arg[i], i]);
                    }
                }
            } else {
                for (i=0;i<arg.length;i++) {
                    callback.apply(arg[i], [arg[i], i]);
                }
            }
        }
    };

    length = function(arg) {
        var length = 0;

        if (arg instanceof Object) {
            each(arg, function() {
                length++;
            });
        } else {
            length = arg.length;
        }

        return length;
    };

    object2Array = function(object) {
        var key, array;

        array = [];

        each(object, function(val) {
            array.push(val);
        });

        return array;
    };

    ascii2map = function(map) {
        var mapArray,
            colMapArray;

        mapArray = [];
        colMapArray = [];

        each(map.ascii, function(line) {
            var lineMapArray,
                lineColMapArray;

            lineMapArray = [];
            lineColMapArray = [];

            each(line, function(chara) {
                var mapping;

                mapping = map.mapping[chara];
                lineMapArray.push(mapping.frame);
                lineColMapArray.push(mapping.hit);
            });

            mapArray.push(lineMapArray);
            colMapArray.push(lineColMapArray);
        });

        return {
            map: mapArray,
            colMap: colMapArray
        };
    };

    message = function(msg) {
        alert(msg);
    };

    bind = function(scope) {
        var handlers = Array.prototype.slice.call(arguments, 1);

        each(handlers, function(handler) {
            var func = scope[handler];

            scope[handler] = function() {
                return func.apply(scope, arguments);
            };
        });
    };

    extend = function(object, args) {
        each(args, function(value, key) {
            object[key] = value;
        });

        return object;
    };

    template = function (tmpl, data) {
        var _settings, _methods;

        _settings = {
            evaluate: /<\%(.+?)\%>/g,
            interpolate: /<\%\=(.+?)\%>/g,
            escaper: /\\|'|\r|\n|\t|\u2028|\u2029/g
        };

        _methods = {
            render: function () {
                var regexp, index, source;

                index = 0;
                source = [];

                regexp = new RegExp([
                    _settings.interpolate.source,
                    _settings.evaluate.source
                ].join('|'), 'g');

                tmpl.replace(regexp, function (match, interpolate, evaluate, offset) {
                    source.push('__t.push(\'' + tmpl.slice(index, offset).replace(_settings.escaper, '') + '\');');

                    if (interpolate) {
                        source.push('__t.push(' + interpolate + ');');
                    }

                    if (evaluate) {
                        source.push(evaluate);
                    }

                    index = offset + match.length;
                });

                if (index === 0) {
                    source.push('__t.push(\'' + tmpl + '\');');
                }

                if (index < tmpl.length) {
                    source.push('__t.push(\'' + tmpl.slice(index).replace(/\n/g, '') + '\');');
                }

                source = 'var __t=[];with(__d||{}){' + source.join('\n') + '};return __t.join(\'\');';

                return new Function('__d', source).apply(null, [data]);
            }
        };

        return _methods.render();
    };

    isEmpty = function(val) {
        return ((val !== undefined) && (val !== null) && (val !== 0) && (val !== '') && (length(val) !== 0)) ? false : true;
    };

    isEqual = function(a, b) {
        return (!isEmpty(a) && (a === b )) ? true : false;
    };

    update = function(a, b, callback) {
        if (!isEmpty(b) && !isEqual(a, b) && (typeof callback === 'function')) {
            callback(b);
        }
    };

    getSign = function(x) {
        var ret;

        if (x < 0) {
            ret = -1;
        } else if (x === 0 && (1/x < 0)) {
            ret = -1;
        } else {
            ret = 1;
        }

        return ret;
    };

    $ = function(selector) {
        if (selector.charAt(0) === '#') {
            return document.getElementById(selector.slice(1));
        } else if (selector.charAt(0) === '.') {
            return document.getElementsByClassName(selector.slice(1));
        } else {
            return document.querySelector(selector);
        }
    };

    exp = {
        each: each,
        length: length,
        object2Array: object2Array,
        ascii2map: ascii2map,
        message: message,
        bind: bind,
        extend: extend,
        template: template,
        isEmpty: isEmpty,
        isEqual: isEqual,
        update: update,
        getSign: getSign,
        $: $
    };

    if (typeof window === 'undefined') {
        module.exports = exp;
    }

    return exp;
});