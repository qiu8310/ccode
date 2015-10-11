'use strict';

var tty = require('tty');
var ts = require('tty-size');
var punycode = require('punycode');
var async = require('async');

// https://en.wikipedia.org/wiki/ANSI_escape_code
var prefix = '\u001b[';
var dsr = prefix + '6n'; // 会转义成类似于 "\u001b[35;1R" 的字符串，其中 35 是当前光标行号，1 是列号

var size;

/**
 * 检查当前环境
 * @param {Function} callback
 * @returns {boolean}
 * @private
 */
function _check(callback) {
  if (!process.stdin.isTTY) {
    callback(new Error('process.stdin stream should be tty.'));
    return false;
  }

  try {
    size = ts();
  } catch (e) {
    callback(new Error('process.stdout and process.stderr at lease one should be tty.'));
    return false;
  }

  return true;
}

/**
 * 将 stdin, stdout, stderr 统一定位到 pos 所在的位置上，并清除 pos 位置之后的内容
 * @param {{row:Number,col:Number}} pos
 * @private
 */
function _clear(pos) {
  [process.stdin, process.stdout, process.stdin].forEach(function (stream) {
    if (stream.isTTY) {
      stream.write(prefix + pos.row + ';' + pos.col + 'H' + prefix + 'J');
    }
  });
}

/**
 * 向 stdin 内写入 text，并截获被终端反转义后的内容
 * @param {String} text
 * @param {Function} callback
 */
function unAnsiEscape(text, callback) {
  _setRawMode(true);
  process.stdin.resume();

  process.stdin.once('data', function (chunk) {
    _setRawMode(false);
    process.stdin.pause();

    callback(chunk.toString());
  });

  process.stdin.write(text);
}

/**
 * 检查整段文本的长度，文本长度不能太长，最好不超过终端的一行
 * @param {String} text
 * @param {Function} callback
 */
function detectShortText(text, callback) {
  if (_check(callback)) {
    unAnsiEscape(dsr + text + dsr, function (str) {
      // 匹配首尾的类似此类字符串
      var matches = str.match(/^\u001b\[\d+;\d+R|\u001b\[\d+;\d+R$/g);

      if (!matches) return callback(new Error('PARSE_ERROR'));

      var pos = matches.map(_parseDSR);
      _clear(pos[0]);
      callback(null, calculateLength(pos[0], pos[1]));
    });
  }
}

/**
 * 检测出 text 文本中每个字符的相关属性
 * @param {String} text
 * @param {Function} callback
 */
function detectEach(text, callback) {
  var numbers = punycode.ucs2.decode(text);
  detectEachNumbers(numbers, callback);
}

/**
 * 检测出 numbers 中每个 number 的相关属性
 * @param {Array<Number>} numbers
 * @param {Function} callback
 */
function detectEachNumbers(numbers, callback) {
  if (_check(callback)) {
    var eachSize = 60; // 每 60 个一组，太长了终端会报错
    async.timesSeries(Math.ceil(numbers.length / eachSize), function (n, next) {
      var cps = numbers.slice(n * eachSize, (n + 1) * eachSize);
      _parseDetectEach(cps, next);
    }, function (err, grouped) {
      if (err) return callback(err);
      var result = [];
      grouped.forEach(function (g) {
        result.push.apply(result, g);
      });
      callback(null, result);
    });
  }
}

function _parseDetectEach(cps, next) {
  // 第一个和最后一个字符的长度有可能计算错误，所以前后多取一个，最后忽略它
  cps.push(32);
  cps.unshift(32);
  var chars = cps.map(_numberToChar);
  unAnsiEscape(dsr + chars.join(dsr) + dsr, function (str) {
    var matches = str.match(/\u001b\[\d+;\d+R/g);

    if (!matches || matches.length !== chars.length + 1) return next(new Error('PARSE_ERROR'));

    matches = matches.map(_parseDSR);
    _clear(matches[0]);
    next(null, chars.map(function (symbol, i) {
      return {
        symbol: symbol,
        number: cps[i],
        size: calculateLength(matches[i], matches[i + 1])
      };
    }).slice(1, -1));
  });
}

function _numberToChar(cp) {
  return punycode.ucs2.encode([cp]);
}

function _setRawMode(mode) {
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(mode);
  } else {
    tty.setRawMode(mode);
  }
}

function _parseDSR(dsr) {
  var parts = dsr.slice(2, -1).split(';').map(Number);
  return { row: parts[0], col: parts[1] };
}

function calculateLength(start, end) {
  // 在同一行上，并且最后一个坐标的横坐标小于开始的，说明换过行，但在 TTY 上如果是最后一行，它只会向上滚动，行号不变
  if (start.row === end.row && start.col > end.col) {
    return size.width - start.col + end.col;
  } else {
    return (end.row - start.row) * size.width + end.col - start.col;
  }
}

module.exports = {
  unAnsiEscape: unAnsiEscape,
  detectEach: detectEach,
  detectShortText: detectShortText,
  detectEachNumbers: detectEachNumbers
};