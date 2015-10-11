'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var LAST_BMP_NUMBER = 65535;
var LAST_NUMBER = 1114111;

var ALL_NUMBERS = [];
var BMP_NUMBERS = [];
for (var i = 0; i <= LAST_NUMBER; i++) {
  ALL_NUMBERS[i] = i;
}for (var i = 0; i <= LAST_BMP_NUMBER; i++) {
  BMP_NUMBERS[i] = i;
} // http://www.unicode.org/Public/MAPPINGS/ISO8859/8859-1.TXT
var FILES = {
  // 美国
  'cp437.txt': 'http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/PC/CP437.TXT',
  // 中国 - 简体中文(GB2312)
  'cp936.txt': 'http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP936.TXT',
  // 繁体中文(Big5)
  'cp950.txt': 'http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP950.TXT',

  'Blocks.txt': 'http://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt',
  'EastAsianWidth.txt': 'http://www.unicode.org/Public/UCD/latest/ucd/EastAsianWidth.txt'
};

exports['default'] = {
  LAST_BMP_NUMBER: LAST_BMP_NUMBER,
  LAST_NUMBER: LAST_NUMBER,
  BMP_NUMBERS: BMP_NUMBERS,
  ALL_NUMBERS: ALL_NUMBERS,
  FILES: FILES
};
module.exports = exports['default'];