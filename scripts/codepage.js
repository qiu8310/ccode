'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

var _libHelper = require('./lib/Helper');

var _libHelper2 = _interopRequireDefault(_libHelper);

var _libRange = require('./lib/Range');

var _libRange2 = _interopRequireDefault(_libRange);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var res = _libHelper2['default'].RESOURCES.FILES;
var cps = [];

_async2['default'].eachSeries(Object.keys(res).filter(function (k) {
  return k.indexOf('cp') === 0;
}), function (k, next) {
  var cpKey = k.replace(/.\w+$/, '');

  _libHelper2['default'].fetchRaw(k, function (err, lines) {
    if (err) return next(err);

    cps.push(k.split('.').shift());
    var data = {};
    var range = [];

    lines.forEach(function (l) {
      var _l$split = l.split(/\s+/);

      var _l$split2 = _slicedToArray(_l$split, 2);

      var cp = _l$split2[0];
      var uni = _l$split2[1];

      if (uni) {
        cp = _libHelper2['default'].parseHex(cp);
        uni = _libHelper2['default'].parseHex(uni);
        data[uni] = cp;
        range.push(uni);
      }
    });

    range = _libRange2['default'].fromNumbers(range);
    _libHelper2['default'].diffBeforeWriteData(cpKey + '-range.json', range);
    _libHelper2['default'].diffBeforeWriteData(cpKey + '.json', data);
    console.log();
    next();
  }, { fetchFromRemote: true });
}, function (err) {
  if (err) throw err;
  _libHelper2['default'].writeData('codepages.json', cps);
});