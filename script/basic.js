var fs = require('fs');
var path = require('path');

var ambRanges = require('../data/ambiguous-width-in-all');
var dobuleRanges = require('../data/double-width-in-all');
var zeroRanges = require('../data/zero-width-in-all');
var blocksData = require('../data/blocks');

var dataRoot = path.join(path.dirname(__dirname), 'data');


var cps = {
  bnf: new Array(0xFFFF),
  all: new Array(0x10FFFF)
};


for (var key in cps) {
  if (cps.hasOwnProperty(key)) {
    for (var i = 0; i < cps[key].length; i++) {
      cps[key][i] = i;
    }
  }
}

function isCodePointInRanges(codePoint, ranges) {
  return ranges.some(function (range) {
    if (range.length === 1) return codePoint === range;
    return codePoint >= range[0] && codePoint <= range[1];
  });
}

function codePointInRangesIndex(codePoint, ranges) {
  var r, i;
  for (i = 0; i < ranges.length; i++) {
    r = ranges[i];
    if (r.length === 1 && r[0] === codePoint) return i;
    if (r.length === 2 && codePoint >= r[0] && codePoint <= r[1]) return i;
  }
  return -1;
}


/*
 0000 0000 - 0000 007F 的字符(0-127)，        用单个字节表示，二进制模板：0xxxxxxx
 0000 0080 - 0000 07FF 的字符(128-32767)，    用两个字节表示，二进制模板：110xxxxx 10xxxxxx
 0000 0800 - 0000 FFFF 的字符(32768-65535)，  用三个字节表示，二进制模板：1110xxxx 10xxxxxx 10xxxxxx
 0001 0000 - 0010 FFFF 的字符(65536-1114111)，用四个字节表示，二进制模板：11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
 */
function codePointToUTF8(codePoint) {
  var tpl;
  if (codePoint <= 0x7F) tpl = '0xxxxxxx';
  else if (codePoint <= 0x7FF) tpl = '110xxxxx10xxxxxx';
  else if (codePoint <= 0xFFFF) tpl = '1110xxxx10xxxxxx10xxxxxx';
  else tpl = '11110xxx10xxxxxx10xxxxxx10xxxxxx';

  var bs = codePoint.toString(2).split('').reverse();
  var b = tpl.split('').reverse().map(function (c) {
    return c === 'x' ? (bs.shift() || '0') : c;
  }).reverse().join('');

  b = parseInt(b, 2).toString(16).toUpperCase();
  if (b.length === 1) b = '0' + b;

  return b.split('')
      .map(function (c, i) { return (i % 2) ? c : ' ' + c; })
      .join('');
}

/*
 SurrogatePairs

 # 正向
 H = Math.floor((C - 0x10000) / 0x400) + 0xD800
 L = (C - 0x10000) % 0x400 + 0xDC00

 # 反向
 C = (H - 0xD800) * 0x400 + L - 0xDC00 + 0x10000

 参考：https://mathiasbynens.be/notes/javascript-encoding#surrogate-pairs
 */
function codePointToUCS2(codePoint) {
  if (codePoint > 0xFFFF) {
    var h = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
    var l = (codePoint - 0x10000) % 0x400 + 0xDC00;
    return '\\u' + h.toString(16).toUpperCase() + '\\u' + l.toString(16).toUpperCase();
  } else {
    var t = codePoint.toString(16).toUpperCase();
    return '\\u' + '0'.repeat(4 - t.length) + t;
  }
}


function isCodePointMatchSize(codePoint, size) {
  if (size === 0) return isCodePointInRanges(codePoint, zeroRanges);
  if (size === 2) return isCodePointInRanges(codePoint, dobuleRanges) || isCodePointAmbiguous(codePoint);
  return true;
}

function codePointSize(codePoint) {
  if (isCodePointInRanges(codePoint, zeroRanges)) return 0;
  if (isCodePointInRanges(codePoint, dobuleRanges)) return 2;
  return false;
}

function isCodePointAmbiguous(codePoint) {
  return isCodePointInRanges(codePoint, ambRanges);
}

function codePointBlock(codePoint) {
  var index = codePointInRangesIndex(codePoint, blocksData.ranges);
  return blocksData.blocks[index] || '[Unknown]';
}


module.exports = {
  readData: function (name) {
    return JSON.parse(fs.readFileSync(path.join(dataRoot, name + '.json')));
  },
  writeData: function (name, data) {
    fs.writeFileSync(path.join(dataRoot, name + '.json'), JSON.stringify(data));
  },
  codePointToUTF8: codePointToUTF8,
  codePointToUCS2: codePointToUCS2,
  isCodePointInRanges: isCodePointInRanges,
  codePointInRangesIndex: codePointInRangesIndex,
  isCodePointAmbiguous: isCodePointAmbiguous,
  isCodePointMatchSize: isCodePointMatchSize,
  codePointSize: codePointSize,
  codePointBlock: codePointBlock,
  lastBNFCharCodePoint: 0xFFFF,
  cps: cps
};
