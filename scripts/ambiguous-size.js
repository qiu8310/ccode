'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libDetector = require('./lib/Detector');

var _libDetector2 = _interopRequireDefault(_libDetector);

var _libHelper = require('./lib/Helper');

var _libHelper2 = _interopRequireDefault(_libHelper);

var _libRange = require('./lib/Range');

var _libRange2 = _interopRequireDefault(_libRange);

var _libChar = require('./lib/Char');

var _libChar2 = _interopRequireDefault(_libChar);

var msg = '"Treat ambiguous-width characters as double width"';
var preFile = 'normal-size.json';

if (!_libHelper2['default'].isAmbiguousEnv()) {
  console.error('Please enable "--amb" option and ' + 'make sure you have checked option ' + msg + ' in your terminal.');
  process.exit(1);
} else {
  console.log('Make sure you have checked option ' + msg + ' in your terminal, ' + 'or running this is useless.');
}

var sizeData = undefined,
    sizeKeys = undefined;
try {
  sizeData = _libHelper2['default'].readData(preFile);
} catch (e) {
  console.error('Please generate "' + preFile + '" first.');
  process.exit(1);
}

sizeKeys = Object.keys(sizeData);
sizeKeys.forEach(function (k) {
  return sizeData[k] = new _libRange2['default'](sizeData[k]);
});

var ambData = {};
var diffData = {};

function addCharTo(c, target) {
  if (!target[c.size]) target[c.size] = new _libRange2['default']();
  target[c.size].add(c.number);
}

_libDetector2['default'].detectEachNumbers(_libChar2['default'].ALL_NUMBERS, function (err, all) {
  if (err) throw err;
  all.forEach(function (c) {
    var s = c.size;
    if (s !== 1) {
      addCharTo(c, ambData);
      if (!sizeData[s].contains(c.number)) addCharTo(c, diffData);
    } else {
      if (sizeKeys.some(function (k) {
        return sizeData[k].contains(c.number);
      })) addCharTo(c, diffData);
    }
  });

  _libHelper2['default'].diffBeforeWriteData('diff-size.json', diffData);
  _libHelper2['default'].diffBeforeWriteData('ambiguous-size.json', ambData);
});