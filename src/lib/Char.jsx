import Range from './Range';
import Helper from './Helper';
import iconv from 'iconv-lite';
import customGroupedNames from './custom-grouped-names';

let LAST_BMP_NUMBER = Helper.RESOURCES.LAST_BMP_NUMBER;

let SIZE_DATA = require('../../data/size-' + (Helper.isAmbiguousEnv() ? 'ambiguous' : 'normal'));
let AMB_RANGE = new Range(require('../../data/size-diff')[2]);
let SIZE_RANGES = {};
Object.keys(SIZE_DATA).forEach(k => SIZE_RANGES[k] = new Range(SIZE_DATA[k]));

let BLOCK_DATA = require('../../data/block');


// http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries
// nonspacing marks and conjoining jamos

function pad(str, len, ch = '0', side = 'left') {
  let l = str.length;
  if (l < len) {
    ch = ch.repeat(len - l);
    str = side === 'left' ? ch + str : str + ch;
  }
  return str;
}

function insert(str, every, ch = ' ') {
  let res = str[0];
  for (let i = 1; i < str.length; i++) {
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
class Char {
  /**
   * @param {Number} number
   */
  constructor(number) {
    this.number = number;
    this._hex = toHex(number);
    this._fourHex = pad(this._hex, 4);
  }

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
  surrogatePairs() {
    if (!this.isAP) throw new Error('Only astral alanes characters have surrogate pairs.');
    return {
      h: toHex(Math.floor((this.number - 0x10000) / 0x400) + 0xD800),
      l: toHex((this.number - 0x10000) % 0x400 + 0xDC00)
    };
  }

  /**
   * 判断是否属于 BasicMultilingualPlane
   * @returns {boolean}
   */
  get isBMP() { return this.number <= LAST_BMP_NUMBER; }

  /**
   * 判断是否属于 AstralPlanes，也叫 SupplementaryPlanes
   * @returns {boolean}
   */
  get isAP() { return this.number > LAST_BMP_NUMBER; }

  /**
   * 是否是 Ambiguous 字符
   * @returns {boolean}
   */
  get ambiguous() { return AMB_RANGE.contains(this.number); }

  /**
   * 返回此字符在终端上的尺寸
   * @returns {number|string}
   */
  get size() {
    if (this.number === 9) return 8;
    if ([8, 10].indexOf(this.number) >= 0) return '';
    if (this.isZeroSize) return 0;
    if (this.isDoubleSize) return 2;
    return 1;
  }

  encode(encoding) {
    let number = this.number;
    let buf = iconv.encode(String.fromCodePoint(number), encoding);
    let str = buf.toString();

    let result = [];

    // iconv 没有编码成功时返回的是 ?
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] === 63 && number !== 63) return '';
      result.push(pad(toHex(buf[i]), 2));
    }

    return result.join(' ');
  }

  /**
   *
   * @returns {string}
   */
  get block() {
    let v;
    for (let k in BLOCK_DATA) {
      if (BLOCK_DATA.hasOwnProperty(k)) {
        v = BLOCK_DATA[k];
        if (this.number <= v[1] && this.number >= v[0]) return k;
      }
    }
  }

  /**
   * 返回此字符在终端上的标识
   *
   * Unicode标准规定U+D800..U+DFFF的值不对应于任何字符
   * 在使用UCS-2的时代，U+D800..U+DFFF内的值被占用，用于某些字符的映射
   *
   * @returns {string}
   */
  get symbol() {
    let map = {
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

  get pinyin() {
    return Helper.findInCompressedRange(require('../../data/han-py'), this.number);
  }
  get wubi() {
    return Helper.findInCompressedRange(require('../../data/han-wb'), this.number);
  }
  get han() {
    let id = Helper.findInCompressedRange(require('../../data/han-link'), this.number);
    if (id) return 'http://zi.artx.cn/zi/ArtX' + id + '.html';
    return '';
  }

  /**
   * 在终端上的长度是否是 0
   * @returns {boolean}
   */
  get isZeroSize() { return SIZE_RANGES['0'].contains(this.number); }

  /**
   * 在终端上的长度是否是 2
   * @returns {boolean}
   */
  get isDoubleSize() { return SIZE_RANGES['2'].contains(this.number); }

  /**
   * 获取标准的 Code Point
   * @returns {string}
   */
  get codePoint() { return 'U+' + this._fourHex; }

  // 进制
  /**
   * @returns {string}
   */
  get binary() { return '0b' + this.number.toString(2); }
  /**
   * @returns {string}
   */
  get octal() { return '0o' + this.number.toString(8); }
  /**
   * @returns {string}
   */
  get hex() { return '0x' + this._hex; }

  // 编码
  /**
   * @returns {string}
   */
  get url() { return '%' + this.utf8.replace(/\s/g, s => '%'); }

  /**
   * 0000 0000 - 0000 007F 的字符(0-127)，        用单个字节表示，二进制模板：0xxxxxxx
   * 0000 0080 - 0000 07FF 的字符(128-32767)，    用两个字节表示，二进制模板：110xxxxx 10xxxxxx
   * 0000 0800 - 0000 FFFF 的字符(32768-65535)，  用三个字节表示，二进制模板：1110xxxx 10xxxxxx 10xxxxxx
   * 0001 0000 - 0010 FFFF 的字符(65536-1114111)，用四个字节表示，二进制模板：11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
   *
   * @returns {string}
   */
  get utf8() {
    var tpl, number = this.number;
    if (number <= 0x7F) tpl = '0xxxxxxx';
    else if (number <= 0x7FF) tpl = '110xxxxx10xxxxxx';
    else if (number <= 0xFFFF) tpl = '1110xxxx10xxxxxx10xxxxxx';
    else tpl = '11110xxx10xxxxxx10xxxxxx10xxxxxx';

    var bs = number.toString(2).split('').reverse();

    var b = tpl.split('').reverse().map(function (c) {
      return c === 'x' ? (bs.shift() || '0') : c;
    }).reverse().join('');

    b = parseInt(b, 2).toString(16).toUpperCase();
    if (b.length === 1) b = '0' + b;

    return insert(b, 2, ' ');
  }

  /**
   * 2-byte Universal Character Set，只能展示 0 - 0xFFFF 之间的数字
   *
   * 采用 iconv 的编码，这里的返回的是 Big Endian 的编码顺序
   *
   * @returns {string}
   */
  get ucs2() {
    if (this.isAP) return '';
    return this.encode('ucs2');
  }

  /*
   * 可以看作是 ucs2 的扩展，对于超过 0xFFFF 的数字用 surrogate pairs 的形式来表示
   *
   * ucs2 缺少对 surrogate pairs 的支持，所以把 surrogate pairs 当作两个字符，
   * 这和 js 非常像，所以说 js 的内部编码更像是 ucs2，而不是 utf16
   *
   * iconv 的返回的 utf16 编码总是多了个 FF FE 在最前面，原因可能是它会自动加上 BOM 信息，方便解码时判断是 BE 还是 LE
   *
   * UTF-16比起UTF-8，好处在于大部分字符都以固定长度的字节（2字节）存储，但UTF-16却无法兼容于ASCII编码
   *
   * @returns {string}
   */
  get utf16() {
    return this.encode('utf16-le');
  }

  /**
   * @returns {string}
   */
  get utf32() {
    return insert(pad(this._fourHex, 8), 2, ' ');
  }

  // 语言
  /**
   * @returns {string}
   */
  get css() { return '\\' + this._hex; }
  /**
   * @returns {string}
   */
  get html() { return '&#x' + this._fourHex; }
  /**
   * @returns {string}
   */
  get js() {
    if (this.isAP) {
      let sp = this.surrogatePairs();
      return '\\u' + sp.h + '\\u' + sp.l;
    } else {
      return '\\u' + this._fourHex;
    }
  }
  /**
   * ES6 中支持的编码
   * @returns {string}
   */
  get es6() { return this.ruby; }

  /**
   * @returns {string}
   */
  get json() { return this.js; }
  /**
   * @returns {string}
   */
  get java() { return this.js; }
  /**
   * @returns {string}
   */
  get ruby() { return '\\u{' + this._hex + '}'; }

  /**
   * @returns {string}
   */
  get perl() { return '\\x{' + this._hex + '}'; }

  /**
   * @returns {string}
   */
  get python() {
    return '\\u' + pad(this._hex, this.isAP ? 8 : 4);
  }

  /**
   * http://php.net/manual/en/function.utf8-encode.php
   *
   * php 内部采用的是 iso-8859-1 的编码
   *
   * @returns {string}
   */
  get php() {
    return '\\x' + this.utf8.split(' ').join('\\x');
  }
}

export default Char;
