'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

var _libHelper = require('./lib/Helper');

var _libHelper2 = _interopRequireDefault(_libHelper);

_libHelper2['default'].fetchRaw('Blocks.txt', function (err, lines) {

  if (err) throw err;

  var data = {};

  lines.forEach(function (l) {
    var _l$split = l.split(/\s*;\s*/);

    var _l$split2 = _slicedToArray(_l$split, 2);

    var range = _l$split2[0];
    var name = _l$split2[1];

    data[name] = range.split('..').map(_libHelper2['default'].parseHex);
    if (data[name].length === 1) data[name].push(data[name][0]);
  });

  _libHelper2['default'].diffBeforeWriteData('block.json', data);
});