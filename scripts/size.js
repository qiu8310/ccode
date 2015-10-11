'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ttyText = require('tty-text');

var _ttyText2 = _interopRequireDefault(_ttyText);

var _libHelper = require('./lib/Helper');

var _libHelper2 = _interopRequireDefault(_libHelper);

var _libRange = require('./lib/Range');

var _libRange2 = _interopRequireDefault(_libRange);

// 首先检查是否是 ambiguous
_libHelper2['default'].isAmbiguous(function (err, isAmbEnv) {

  if (err) throw err;

  if (!isAmbEnv) {
    console.warn('\u001b[33mIf you want to calculate East Asian Ambiguous Character\'s size, ' + 'make sure you have checked "Treat ambiguous-width characters as double width"' + ' in your terminal preferences setting, and run this again.\u001b[m\n');

    console.warn('\u001b[94mMore About East Asian Ambiguous Character on http://unicode.org/reports/tr11/\u001b[m\n');
  }

  var isWin = _libHelper2['default'].isWin;
  var winPrefix = isWin ? 'win-' : '';
  var normalSizeFile = winPrefix + 'size-normal.json';
  var ambiguousSizeFile = winPrefix + 'size-ambiguous.json';
  var diffSizeFile = winPrefix + 'size-diff.json';

  // 数据集，及添加到数据集的方法
  var sizeData = {},
      oppoSizeData = undefined,
      oppoSizeKeys = undefined,
      diffSizeData = undefined;
  var addCharTo = function addCharTo(c, target) {
    if (!target[c.size]) target[c.size] = new _libRange2['default']();
    target[c.size].add(c.number);
  };

  try {
    oppoSizeData = _libHelper2['default'].readData(isAmbEnv ? normalSizeFile : ambiguousSizeFile);
    diffSizeData = {};
    oppoSizeKeys = Object.keys(oppoSizeData);
    oppoSizeKeys.forEach(function (k) {
      return oppoSizeData[k] = new _libRange2['default'](oppoSizeData[k]);
    });
  } catch (e) {}

  _ttyText2['default'].detectEachNumbers(_libHelper2['default'].RESOURCES.ALL_NUMBERS, function (err, all) {
    if (err) throw err;

    all.forEach(function (c) {
      var s = c.size;
      // 忽略 \b 和 \n
      if (c.number === 8 || c.number === 10) return true;

      if (s !== 1) {
        // 不记录长度是 1 的字符
        addCharTo(c, sizeData);
        if (oppoSizeData && (!oppoSizeData[s] || !oppoSizeData[s].contains(c.number))) addCharTo(c, diffSizeData);
      } else if (oppoSizeData) {
        if (oppoSizeKeys.some(function (k) {
          return oppoSizeData[k].contains(c.number);
        })) addCharTo(c, diffSizeData);
      }
    });

    if (diffSizeData && isAmbEnv) _libHelper2['default'].diffBeforeWriteData(diffSizeFile, diffSizeData);

    _libHelper2['default'].diffBeforeWriteData(isAmbEnv ? ambiguousSizeFile : normalSizeFile, sizeData);
  });
});