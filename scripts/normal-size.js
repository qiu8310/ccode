'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libDetector = require('./lib/Detector');

var _libDetector2 = _interopRequireDefault(_libDetector);

var _libHelper = require('./lib/Helper');

var _libHelper2 = _interopRequireDefault(_libHelper);

var _libRange = require('./lib/Range');

var _libRange2 = _interopRequireDefault(_libRange);

//import Char from './lib/Char';

// 首先检查是否是 ambiguous
_libHelper2['default'].isAmbiguous(function (err, isAmbEnv) {

  if (err) throw err;

  var isWin = _libHelper2['default'].isWin;
  var terminalOpt = '"Treat ambiguous-width characters as double width"';
  var normalSizeFile = (isWin ? 'win-' : '') + 'normal-size.json';
  var ambiguousSizeFile = (isWin ? 'win-' : '') + 'ambiguous-size.json';
  var oppositeSizeData = null;

  try {
    oppositeSizeData = _libHelper2['default'].readData(isAmbEnv ? normalSizeFile : ambiguousSizeFile);
  } catch (e) {}

  if (oppositeSizeData) {
    console.warn('\u001b[33m  If you want to calculate East Asian Ambiguous Character\'s size, ' + 'make sure you have ' + (isAmbEnv ? 'un-' : '') + 'checked ' + terminalOpt + ' in your terminal preferences setting.\u001b[m\n');

    console.warn('More About East Asian Ambiguous Character on http://unicode.org/reports/tr11/\n');
  }

  //Detector.detectEachNumbers(Char.ALL_NUMBERS, (err, all) => {
  //
  //  if (err) throw err;
  //
  //  let sizeData = {};
  //  all.forEach(c => {
  //    if (c.size === 1) return true; // 不记录长度是 1 的字符
  //    let r = sizeData[c.size];
  //    if (!r) r = sizeData[c.size] = new Range();
  //    r.add(c.number);
  //  });
  //
  //  Helper.diffBeforeWriteData(isAmbEnv ? ambiguousSizeFile : normalSizeFile, sizeData);
  //
  //});
});