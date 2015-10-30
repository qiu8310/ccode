import tw from 'tty-wrap';
import _ from 'lodash';
import punycode from 'punycode';
import Char from '../lib/Char';

import Range from '../lib/Range';
import Detector from 'tty-detect';
import iconv from 'iconv-lite';
import chalk from 'chalk';
import base from './base';


const SPECIAL_STRINGS = [
  'Z̞̯̞̠͍͑ͫ̓ͪ̂A̴̵̜͔ͫ͗͢L̠ͨͧͩ͘Ǫ̵̝̳͂̌̌͘!͖̬̙̗̿̋',
  '\u1101\u1161\u11a8♡\t\u0303汉💩\u030C\u0348\u0320',
  '★ ☂ ☯ ❄ ♫ ✂'
];

const MERGEABLE = [['js', 'java'], ['utf16', 'utf16-le']];
const HAN_RANGE = new Range(require('../../data/han-range'));


function randomStr() {
  return SPECIAL_STRINGS[Date.now() % SPECIAL_STRINGS.length];
}


function parseArgvToStr(argv) {
  let str = '';
  argv._.forEach(arg => {
    arg = arg.toString();
    arg = arg
        .replace(/[\\]*u\+?(\{?[\da-f]{4,7})\}?/ig, (r, code) => {
          // return String.fromCodePoint(parseInt(code, 16));
          return parseInt(code, 16).toString();
        })
        .replace(/0x[\da-f]{1,7}/ig, r => {
          return parseInt(r, 16).toString();
        });

    if (/^\d+(\-\d+)?$/.test(arg)) {
      let [from, to] = arg.split('-').map(Number);
      if (to == null) to = from;
      from -= argv.before;
      to += argv.after;

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


function _encodingToSortValue(encoding, GROUPS) {
  let startGs = ['system', 'fe', 'lang'], index;
  let lastGs = ['han'];

  let gap = 20;

  for (let i = 0; i < startGs.length; i++) {
    index = GROUPS[startGs[i]].indexOf(encoding);
    if (index >= 0) return i * gap + i + index;
  }

  for (let i = 0; i < lastGs.length; i++) {
    index = GROUPS[lastGs[i]].indexOf(encoding);
    if (index >= 0) return i * gap + i + 0xFFFFFF;
  }

  return encoding.replace(/-.*$/, '-').match(/\d+|[\w!]/g).reduce((memo, c, index) => {

    if (/\d/.test(c)) memo += parseInt(c, 10) * 2; // 保证 utf7 到 utf8 之间还能有其它编码，如 utf7-imap
    else memo += c.codePointAt(0) * 1000; // 保证字母的权重不落后于数字

    if (c === '-') memo += 1; // - 是为了使类似于 utf7 utf7-imap utf8 按此顺序排，而不是 utf7 utf8 utf7-imap
    else memo += index * 500; // 500 是保证编码排序字母越在前面，权重越大

    return memo;

  }, gap * startGs.length);
}


function getAutoIncludeColumns(chars) {
  let columns = [];
  if (chars.some(char => HAN_RANGE.contains(char.number))) columns.push('wubi', 'pinyin');
  if (chars.some(char => char.ambiguous)) columns.push('ambiguous');
  return columns;
}

function getColumns (autoColumns, argv, GROUPS) {
  let columns = autoColumns || [],
      char = new Char(100);

  ['include', 'exclude'].forEach(k => argv[k] = argv[k] || []);

  let groups = (argv.group || ['default']).map(g => GROUPS[g]);
  groups.push(argv.include);

  columns =groups.reduce((memo, group) => {
    group.forEach(k => {
      if (memo.indexOf(k) < 0) memo.push(k);
    });
    return memo;
  }, columns);

  columns = columns
    .map(c => c.toLowerCase().replace(/^(utf|ucs)-/, '$1'))
    .sort((a, b) => _encodingToSortValue(a, GROUPS) - _encodingToSortValue(b, GROUPS));

  columns.push('size', 'block');

  return columns.filter(k => argv.exclude.indexOf(k) < 0 && ((k in char) || iconv.encodingExists(k)));
}

function mergeColumns (columns) {
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

export default function (argv) {

  // let str = parseArgvToStr(argv);
  // if (!str) str = randomStr();
  // Detector.detectEach(str, (err, all) => {
  //   if (err) throw err;
  //   let chars = all.map(c => new Char(c.number));
  //   let autoColumns = getAutoIncludeColumns(chars);

  //   outputCharsList(chars, mergeColumns(getColumns(autoColumns, argv, GROUPS)), argv);

  //   Detector.detectShortText(str, (err, len) => {
  //     if (err) throw err;
  //     console.log(chalk.bold('\n   字符数： %s \t组合结果：%s \t组合长度：%s '),
  //       chalk.green(chars.length), chalk.green(str), chalk.green(len), '\n');
  //   });
  // });
}

function outputCharsList(chars, columns, argv) {

  columns.unshift('Nr.', 'symbol');

  let charKeyMap = {'Nr.': 'number'};
  let escapes = argv.escape || [];
  let escapeStrs = new Array(escapes.length);

  let data = chars.map(char => {
    escapes.forEach((key, i) => {
      if (!escapeStrs[i]) escapeStrs[i] = '';
      escapeStrs[i] += char[key];
    });

    return columns.reduce((memo, key, l) => {
      let val;
      let charKey = charKeyMap[key] || (key.indexOf('/') > 0 ? key.split('/').shift().trim() : key);
      if (charKey in char) val = char[charKey];
      else val = char.encode(charKey);

      memo[key] = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val;

      return memo;
    }, {});
  });

  console.log(tw.table(
      data,
      {
        left: 4,
        showHead: true,
        border: argv.border
      },
      {
        head: { color: 'bold.white', padding: '1' },
        colA: { color: 'gray', align: 'right' },
        colAmbiguous: { align: 'center' },
        colSize: { align: 'center' },
        colSymbol: { color: 'green', align: 'center' }
      }
  ));

  if (escapeStrs.length) {
    console.log();
    escapes.forEach((key, i) => {
      console.log(chalk.bold('   Escape ' + key + ': ' + chalk.yellow.bold(escapeStrs[i])));
    });
  }


}
