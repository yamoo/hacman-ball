HAC.define('BaseMapData',[
    'Const'
], function(Const) {
    var ascii,
        mapping;

    ascii = [
        '┌----------------------┐',
        '|                      |',
        '|                      |',
        '|                      |',
        '|                      |',
        '|                      |',
        '└-                    -┘',
        'x                      x',
        'x                      x',
        'x                      x',
        'x                      x',
        '┌-                    -┐',
        '|                      |',
        '|                      |',
        '|                      |',
        '|                      |',
        '|                      |',
        '└----------------------┘'
    ];

    mapping = {
        ' ': {frame: 0, hit: 0},
        'x': {frame: 0, hit: 1},
        '┌': {frame: 1, hit: 1},
        '┐': {frame: 2, hit: 1},
        '└': {frame: 3, hit: 1},
        '┘': {frame: 4, hit: 1},
        '-': {frame: 5, hit: 1},
        '|': {frame: 6, hit: 1}
    };

    return {
        ascii: ascii,
        mapping: mapping
    };
});