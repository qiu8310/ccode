import ttyTextSize from 'tty-text-size';
import ttyDetect from 'tty-detect';
import punycode from 'punycode';
import iconv from 'iconv-lite';
import chalk from 'chalk';
import tw from 'tty-wrap';
import _ from 'lodash';

import Char from '../lib/Char';
import Range from '../lib/Range';
import Helper from '../lib/Helper';

const SPECIAL_STRINGS = [
  'Z̞̯̞̠͍͑ͫ̓ͪ̂A̴̵̜͔ͫ͗͢L̠ͨͧͩ͘Ǫ̵̝̳͂̌̌͘!͖̬̙̗̿̋',
  '\u1101\u1161\u11a8♡\t\u0303汉💩\u030C\u0348\u0320',
  '★ ☂ ☯ ❄ ♫ ✂'
];

const HAN_RANGE = new Range(require('../../data/han-range'));
const LAST_NUMBER = Helper.RESOURCES.LAST_NUMBER;
const MERGEABLE = [['js', 'java'], ['utf16', 'utf16-le']];

const columnGroups = {
  'default': ['hex', 'utf8', 'ucs2', 'js', 'html', 'css', 'cp936'],
  charset: ['utf7', 'utf7-imap', 'utf8', 'ucs2', 'utf16', 'utf16-be', 'utf32'],
  system: ['binary', 'octal', 'hex'],
  lang: ['java', 'ruby', 'perl', 'python', 'php', 'js', 'es6', 'html', 'css'],
  node: ['utf8', 'ucs2', 'utf16-le', 'ascii', 'base64'],
  han: ['wubi', 'pinyin', 'han'],

  // double bytes
  db: ['cp932', 'cp936', 'cp949', 'cp950', 'gb2313', 'gbk', 'gb18030', 'big5', 'shift_jis', 'euc-jp'],
  iso: ['iso88591', 'iso88592', 'iso88593', 'iso88594', 'iso88595', 'iso88596', 'iso88597', 'iso88598',
        'iso88599', 'iso885910', 'iso885911', 'iso885912', 'iso885913', 'iso885914', 'iso885915', 'iso885916'],
  fe: ['js', 'es6', 'html', 'css'],
  bare: []
};

const columnMap = {
  number: 'Nr.'
};

const yargsOptions = {
  includes: {
    alias: ['include', 'i'],
    desc: '添加指定的列，比如：--include php java  # 添加 php, java 的列信息',
    type: 'array'
  },
  excludes: {
    alias: ['exclude', 'e'],
    desc: '排除指定的列，比如：--exclude css utf8  # 排除 css, utf8 的列信息',
    type: 'array'
  },
  groups: {
    alias: ['group', 'g'],
    desc: '选定某个或某几个分组，每个分组里都预定义了一些列',
    choices: Object.keys(columnGroups),
    type: 'array'
  },
  escapes: {
    alias: ['escape', 'x'],
    desc: '根据指定的语言转义输入的字符',
    choices: columnGroups.lang,
    type: 'array',
    requiresArg: true
  },
  highlightColumns: {
    alias: ['hc'],
    desc: '高亮指定的列',
    type: 'array',
    requiresArg: true
  },
  highlightColumnsColor: {
    alias: 'hcc',
    'default': 'bgYellow.red',
    desc: '指定高亮的颜色',
    type: 'string',
    requiresArg: true
  },
  detect: {
    desc: '是否使用 ansi 技术检查每个字符在终端上的长度，如果长度和默认的长度不一样，size 字段会变红，detectedSize 放在括号内',
    type: 'boolean',
    'default': true
  },
  border: {
    desc: '显示表格时添加边框',
    choices: ['simple', 'single', 'double']
  },
  before: {
    alias: 'B',
    desc: '指定范围前面有多少个字符',
    type: 'string',
    'default': 0
  },
  after: {
    alias: 'A',
    desc: '指定范围后面有多少个字符',
    type: 'string',
    'default': 0
  }
}


function makeYargsOpts(excludes = []) {
  if (!excludes.length) return yargsOptions;

  let res = {};
  Object.keys(yargsOptions).forEach(k => {
    if (excludes.indexOf(k) < 0) res[k] = yargsOptions[k];
  });
  return res;
}

function yargsOptionsPostProcess (argv) {
  let opts = {};
  Object.keys(yargsOptions).forEach(k => {
    if (argv[k] !== undefined) {
      opts[k] = argv[k];
    }
  });

  ['after', 'before'].forEach(k => {
    if (opts[k] === '') opts[k] = 10; // 如果指定为空，则取 10
    else if (typeof opts[k] === 'string') opts[k] = parseInt(opts[k]) || 0;
  });

  return opts;
}

function randomCCodeString() {
  return SPECIAL_STRINGS[Date.now() % SPECIAL_STRINGS.length];
}


// 给 column 排序用的
function _columnSortValue(column) {
  let startGroups = ['system', 'fe', 'lang'];
  let lastGroups = ['han'];
  let gap = 20, index;

  for (let i = 0; i < startGroups.length; i++) {
    index = columnGroups[startGroups[i]].indexOf(column);
    if (index >= 0) return i * gap + i + index;
  }

  for (let i = 0; i < lastGroups.length; i++) {
    index = columnGroups[lastGroups[i]].indexOf(column);
    if (index >= 0) return i * gap + i + 0xFFFFFF;
  }

  return column.replace(/-.*$/, '-').match(/\d+|[\w!]/g).reduce((memo, c, index) => {

    if (/\d/.test(c)) memo += parseInt(c, 10) * 2; // 保证 utf7 到 utf8 之间还能有其它编码，如 utf7-imap
    else memo += c.codePointAt(0) * 1000; // 保证字母的权重不落后于数字

    if (c === '-') memo += 1; // - 是为了使类似于 utf7 utf7-imap utf8 按此顺序排，而不是 utf7 utf8 utf7-imap
    else memo += index * 500; // 500 是保证编码排序字母越在前面，权重越大

    return memo;

  }, gap * startGroups.length);
}



/**
 * 第一步：解析出需要处理的字符串
 *
 * @param  {array} args
 * @param  {object} opts
 *
 *         - {number} before
 *         - {number} after
 */
function getStringFromArgs(args, {before = 0, after = 0} = {}) {
  let str = '';
  args.forEach(arg => {
    arg = arg.toString();
    arg = arg
        // \u4E2D => 中
        .replace(/[\\]u(\{?[\da-f]{4,7})\}?/ig, (r, code) => {
          return String.fromCodePoint(parseInt(code, 16));
        })
        // U+4E2D / U4E2D => 20013
        .replace(/u\+?(\{?[\da-f]{4,7})\}?/ig, (r, code) => {
          return parseInt(code, 16).toString();
        })
        // 0x4E2D / 0o47055 / 0b100111000101101 => 20013
        .replace(/0[xob][\da-f]+/ig, r => {
          return parseInt(r).toString();
        });

    if (/^\d+(\-\d+)?$/.test(arg)) {
      let [from, to] = arg.split('-').map(Number);
      if (to == null) to = from;
      from -= before;
      to += after;

      let codes = [], i;
      for (i = from; i <= to; i++)
        if (i <= LAST_NUMBER)
          codes.push(i);

      str += punycode.ucs2.encode(codes);
    } else {
      str += arg;
    }
  });

  return str;
}

/**
 * 第二步：将字符串解析成一个个的 Char
 *
 * @param  {string}   str            要解析的字符串
 * @param  {function} cb             回调函数，两个参数： error, chars
 * @param  {object}   options
 *
 *         - {boolean} detect 是否使用 ansi 技术检查每个字符在终端上的长度
 */
function getCharsFromString(str, cb, {detect = false} = {}) {
  let numbers = punycode.ucs2.decode(str);
  let chars = numbers.map(n => new Char(n));

  if (!detect) return cb(null, chars);

  ttyDetect.detectEachNumbers(numbers, (err, result) => {
    if (err) return cb(err);
    chars.forEach((c, i) => c.detectedSize = result[i].size);
    cb(null, chars);
  });
}


// 3.1 自动包含一些 columns
function _autoColumns(chars) {
  let columns = [];
  if (chars.some(char => HAN_RANGE.contains(char.number))) columns.push('wubi', 'pinyin');
  if (chars.some(char => char.ambiguous)) columns.push('ambiguous');
  return columns;
}

// 3.2 过滤 columns
function _filterColumns(columns, opts) {
  let char = new Char(100);

  let groups = opts.groups.map(g => columnGroups[g]);

  columns = groups.concat([opts.includes]).reduce((memo, group) => {
    group.forEach(k => {
      if (memo.indexOf(k) < 0) memo.push(k);
    });
    return memo;
  }, columns);


  columns = columns
    .map(c => c.toLowerCase().replace(/^(utf|ucs)-/, '$1'))
    .sort((a, b) => _columnSortValue(a) - _columnSortValue(b));

  columns.push('size', 'block');

  return columns.filter(k => opts.excludes.indexOf(k) < 0 && ((k in char) || iconv.encodingExists(k)));
}

// 3.3 合并 columns
function _mergeColumns(columns) {
  let result = [];
  let map = {}, i, col, mapKey;

  for (i = 0; i < columns.length; i++) {
    col = columns[i];
    mapKey = _.findIndex(MERGEABLE, g => g.indexOf(col) >= 0);
    if (mapKey >= 0 && map[mapKey]) {
      map[mapKey].push(col);
    } else if (mapKey >= 0) {
      map[mapKey] = [col];
      result.push(map[mapKey]);
    } else {
      result.push(col);
    }
  }

  return result.map(c => Array.isArray(c) ? c.join(' / ') : c);
}

/**
 * 第三步：根据 chars 和配置项得到需要在表格上显示的 columns
 * @param  {array} chars           所有的字符
 * @param  {object}  options
 *         - {array} include
 *         - {array} exclude
 *         - {array} group
 * @return {array}
 */
function getColumnsFromChars(chars, {includes = [], excludes = [], groups = ['default']}) {
  let columns = _autoColumns(chars);

  columns = _filterColumns(columns, {includes, excludes, groups});
  return _mergeColumns(columns);
}


// 第四步：输出 table
function outputTable(chars, columns, {escapes = [], highlightColumns = [], highlightColumnsColor, border} = {}) {

  columns.unshift('number', 'symbol');

  let head = [];

  let escapeStrs = new Array(escapes.length);

  let data = chars.map(char => {
    escapes.forEach((key, i) => {
      if (!escapeStrs[i]) escapeStrs[i] = '';
      escapeStrs[i] += char[key];
    });

    return columns.reduce((memo, key, l) => {
      let val;
      let charKey = (key.indexOf('/') > 0 ? key.split('/').shift().trim() : key);
      if (charKey in char) val = char[charKey];
      else val = char.encode(charKey);

      val = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val;
      if (key === 'size' && 'detectedSize' in char && char.detectedSize !== char.size) {
        memo[key] = chalk.red(val + ' ( ' + char.detectedSize + ' )');
      } else {
        memo[key] = val;
      }
      return memo;
    }, {});
  });

  head = columns.map(c => columnMap[c] || c.toUpperCase());

  let tableAttrs = {
    left: 3,
    right: 4,
    head,
    border: border
  };
  let tableStyles = {
    head: { color: 'bold.white', padding: '1' },
    colA: { color: 'gray', align: 'right' },
    colAMBIGUOUS: { align: 'center' },
    colSIZE: { align: 'center' },
    colSYMBOL: { color: 'green', align: 'center' }
  };

  let setColor = (key, color) => {
    let sty = tableStyles[key];
    if (!sty) sty = tableStyles[key] = {};
    sty.color = color;
  };

  highlightColumns.forEach(c => {
    c = c.toUpperCase();
    let index = head.indexOf(c);
    if (index >= 0) {
      setColor('col' + c, highlightColumnsColor);
    }
  });

  console.log('%s%s', tw.table(data, tableAttrs, tableStyles), '\n');
  if (escapeStrs.length) {
    _outputEscape(escapes, escapeStrs);
  }
}

function _outputEscape(escapes, escapeStrs) {
  let data = [];
  escapes.forEach((key, i) => {
    data.push(['Escape ' + key.toUpperCase() + ' : ', escapeStrs[i]]);
  });
  console.log(tw.table(data, {left: 3, right: 4,}, {colA: {color: 'bold'}, colB: {color: 'yellow.bold'}}));
  console.log();
}


function outputSummary(str, chars, opts) {
  let tpl = '    组合结果：%s \t组合字符数： %s \t';
  let tLen = chalk.green(chars.length);
  let tStr = chalk.green(str);

  if (opts.detect) {
    ttyDetect.detectShortText(str, (err, len) => {
      if (err) throw err;
      console.log(chalk.bold(tpl + '组合长度：%s ') + '\n', tStr, tLen, chalk.green(len));
    });
  } else {
    console.log(chalk.bold(tpl) + '\n', tStr, tLen);
  }
}


export default {
  makeYargsOpts,

  parseArgvToTable(argv) {
    let opts = yargsOptionsPostProcess(argv);
    let str = argv._.length ? getStringFromArgs(argv._, opts) : randomCCodeString();

    getCharsFromString(str, (err, chars) => {
      if (err) throw err;
      let columns = getColumnsFromChars(chars, opts);
      outputTable(chars, columns, opts);
      outputSummary(str, chars, opts);
    }, opts);
  }

};






