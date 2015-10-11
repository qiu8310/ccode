'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Range = require('./Range');

var _Range2 = _interopRequireDefault(_Range);

var _Helper = require('./Helper');

var _Helper2 = _interopRequireDefault(_Helper);

var LAST_BMP_NUMBER = _Helper2['default'].RESOURCES.LAST_BMP_NUMBER;

var SIZE_DATA = require('../../data/size-' + (_Helper2['default'].isAmbiguousEnv() ? 'ambiguous' : 'normal'));
var AMB_RANGE = new _Range2['default'](require('../../data/size-diff')[2]);
var SIZE_RANGES = {};
Object.keys(SIZE_DATA).forEach(function (k) {
  return SIZE_RANGES[k] = new _Range2['default'](SIZE_DATA[k]);
});

var BLOCK_DATA = require('../../data/block');

// http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries
// nonspacing marks and conjoining jamos

function pad(str, len) {
  var ch = arguments[2] === undefined ? '0' : arguments[2];
  var side = arguments[3] === undefined ? 'left' : arguments[3];

  var l = str.length;
  if (l < len) {
    ch = ch.repeat(len - l);
    str = side === 'left' ? ch + str : str + ch;
  }
  return str;
}

function insert(str, every) {
  var ch = arguments[2] === undefined ? ' ' : arguments[2];

  var res = str[0];
  for (var i = 1; i < str.length; i++) {
    if (i % every === 0) res += ch;
    res += str[i];
  }
  return res;
}

function toHex(number) {
  return number.toString(16).toUpperCase();
}

/**
 * @NOTE 注意，如果某个编码返回一个空字符串，表示此编码不支持此 number
 */

var Char = (function () {
  /**
   * @param {Number} number
   */

  function Char(number) {
    _classCallCheck(this, Char);

    this.number = number;
    this._hex = toHex(number);
    this._fourHex = pad(this._hex, 4);
  }

  _createClass(Char, [{
    key: 'surrogatePairs',

    /**
     *  SurrogatePairs
     *
     * # 正向
     *  H = Math.floor((C - 0x10000) / 0x400) + 0xD800
     *  L = (C - 0x10000) % 0x400 + 0xDC00
     *
     * # 反向
     *  C = (H - 0xD800) * 0x400 + L - 0xDC00 + 0x10000
     *
     * 参考：https://mathiasbynens.be/notes/javascript-encoding#surrogate-pairs
     */
    value: function surrogatePairs() {
      if (!this.isAP) throw new Error('Only astral alanes characters have surrogate pairs.');
      return {
        h: toHex(Math.floor((this.number - 65536) / 1024) + 55296),
        l: toHex((this.number - 65536) % 1024 + 56320)
      };
    }
  }, {
    key: 'cp',
    value: function cp(code) {
      var data = require('../../data/' + code + '.json');
      var num = this.number.toString();
      return num in data ? '0x' + toHex(data[num]) : '';
    }
  }, {
    key: 'isBMP',

    /**
     * 判断是否属于 BasicMultilingualPlane
     * @returns {boolean}
     */
    get: function () {
      return this.number <= LAST_BMP_NUMBER;
    }
  }, {
    key: 'isAP',

    /**
     * 判断是否属于 AstralPlanes，也叫 SupplementaryPlanes
     * @returns {boolean}
     */
    get: function () {
      return this.number > LAST_BMP_NUMBER;
    }
  }, {
    key: 'isAmbiguous',

    /**
     * 是否是 Ambiguous 字符
     * @returns {boolean}
     */
    get: function () {
      return AMB_RANGE.contains(this.number);
    }
  }, {
    key: 'size',

    /**
     * 返回此字符在终端上的尺寸
     * @returns {number|string}
     */
    get: function () {
      if (this.number === 9) return 8;
      if ([8, 10].indexOf(this.number) >= 0) return '';
      if (this.isZeroSize) return 0;
      if (this.isDoubleSize) return 2;
      return 1;
    }
  }, {
    key: 'block',

    /**
     *
     * @returns {string}
     */
    get: function () {
      var v = undefined;
      for (var k in BLOCK_DATA) {
        if (BLOCK_DATA.hasOwnProperty(k)) {
          v = BLOCK_DATA[k];
          if (this.number <= v[1] && this.number >= v[0]) return k;
        }
      }
    }
  }, {
    key: 'symbol',

    /**
     * 返回此字符在终端上的标识
     * @returns {string}
     */
    get: function () {
      var map = {
        0: '\\0',
        8: '\\b',
        9: '\\t',
        10: '\\n',
        11: '\\v',
        12: '\\f',
        13: '\\r'
      };
      return map[this.number] || String.fromCodePoint(this.number);
    }
  }, {
    key: 'isZeroSize',

    /**
     * 在终端上的长度是否是 0
     * @returns {boolean}
     */
    get: function () {
      return SIZE_RANGES['0'].contains(this.number);
    }
  }, {
    key: 'isDoubleSize',

    /**
     * 在终端上的长度是否是 2
     * @returns {boolean}
     */
    get: function () {
      return SIZE_RANGES['2'].contains(this.number);
    }
  }, {
    key: 'codePoint',

    /**
     * 获取标准的 Code Point
     * @returns {string}
     */
    get: function () {
      return 'U+' + this._fourHex;
    }
  }, {
    key: 'binary',

    // 进制
    /**
     * @returns {string}
     */
    get: function () {
      return '0b' + this.number.toString(2);
    }
  }, {
    key: 'octal',

    /**
     * @returns {string}
     */
    get: function () {
      return '0o' + this.number.toString(8);
    }
  }, {
    key: 'hex',

    /**
     * @returns {string}
     */
    get: function () {
      return '0x' + this._hex;
    }
  }, {
    key: 'url',

    // 编码
    /**
     * @returns {string}
     */
    get: function () {
      return '%' + this.utf8.replace(/\s/g, function (s) {
        return '%';
      });
    }
  }, {
    key: 'utf8',

    /**
     * 0000 0000 - 0000 007F 的字符(0-127)，        用单个字节表示，二进制模板：0xxxxxxx
     * 0000 0080 - 0000 07FF 的字符(128-32767)，    用两个字节表示，二进制模板：110xxxxx 10xxxxxx
     * 0000 0800 - 0000 FFFF 的字符(32768-65535)，  用三个字节表示，二进制模板：1110xxxx 10xxxxxx 10xxxxxx
     * 0001 0000 - 0010 FFFF 的字符(65536-1114111)，用四个字节表示，二进制模板：11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
     *
     * @returns {string}
     */
    get: function () {
      var tpl,
          number = this.number;
      if (number <= 127) tpl = '0xxxxxxx';else if (number <= 2047) tpl = '110xxxxx10xxxxxx';else if (number <= 65535) tpl = '1110xxxx10xxxxxx10xxxxxx';else tpl = '11110xxx10xxxxxx10xxxxxx10xxxxxx';

      var bs = number.toString(2).split('').reverse();

      var b = tpl.split('').reverse().map(function (c) {
        return c === 'x' ? bs.shift() || '0' : c;
      }).reverse().join('');

      b = parseInt(b, 2).toString(16).toUpperCase();
      if (b.length === 1) b = '0' + b;

      return insert(b, 2, ' ');
    }
  }, {
    key: 'ucs2',

    /**
     * 2-byte Universal Character Set，只能展示 0 - 0xFFFF 之间的数字
     *
     * @returns {string}
     */
    get: function () {
      if (this.isAP) return '';
      return insert(this._fourHex, 2, ' ');
    }
  }, {
    key: 'utf16',

    /**
     * 可以看作是 ucs2 的扩展，对于超过 0xFFFF 的数字用 surrogate pairs 的形式来表示
     *
     * ucs2 缺少对 surrogate pairs 的支持，所以把 surrogate pairs 当作两个字符，
     * 这和 js 非常像，所以说 js 的内部编码更像是 ucs2，而不是 utf16
     *
     * @returns {string}
     */
    get: function () {
      if (this.isAP) {
        var sp = this.surrogatePairs();
        return insert(sp.h + sp.l, 2, ' ');
      } else {
        return this.ucs2;
      }
    }
  }, {
    key: 'utf32',

    /**
     * @returns {string}
     */
    get: function () {
      return insert(pad(this._fourHex, 8), 2, ' ');
    }
  }, {
    key: 'css',

    // 语言
    /**
     * @returns {string}
     */
    get: function () {
      return '\\' + this._hex;
    }
  }, {
    key: 'html',

    /**
     * @returns {string}
     */
    get: function () {
      return '&#x' + this._fourHex;
    }
  }, {
    key: 'js',

    /**
     * @returns {string}
     */
    get: function () {
      if (this.isAP) {
        var sp = this.surrogatePairs();
        return '\\u' + sp.h + '\\u' + sp.l;
      } else {
        return '\\u' + this._fourHex;
      }
    }
  }, {
    key: 'es6',

    /**
     * ES6 中支持的编码
     * @returns {string}
     */
    get: function () {
      return this.ruby;
    }
  }, {
    key: 'json',

    /**
     * @returns {string}
     */
    get: function () {
      return this.js;
    }
  }, {
    key: 'java',

    /**
     * @returns {string}
     */
    get: function () {
      return this.js;
    }
  }, {
    key: 'ruby',

    /**
     * @returns {string}
     */
    get: function () {
      return '\\u{' + this._hex + '}';
    }
  }, {
    key: 'perl',

    /**
     * @returns {string}
     */
    get: function () {
      return '\\x{' + this._hex + '}';
    }
  }, {
    key: 'python',

    /**
     * @returns {string}
     */
    get: function () {
      return '\\u' + pad(this._hex, this.isAP ? 8 : 4);
    }
  }, {
    key: 'php',

    /**
     * http://php.net/manual/en/function.utf8-encode.php
     *
     * php 内部采用的是 iso-8859-1 的编码
     *
     * @returns {string}
     */
    get: function () {
      return '\\x' + this.utf8.split(' ').join('\\x');
    }
  }]);

  return Char;
})();

exports['default'] = Char;
module.exports = exports['default'];