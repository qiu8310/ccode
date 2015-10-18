import tw from 'tty-wrap';
import _ from 'lodash';
import punycode from 'punycode';
import Char from '../lib/Char';
import Helper from '../lib/Helper';
import Detector from 'tty-detect';
import iconv from 'iconv-lite';

const chalk = tw.chalk;
const LAST_NUMBER = Helper.RESOURCES.LAST_NUMBER;

const SPECIAL_STRINGS = [
  'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞',
  '\u1101\u1161\u11a8\u2661\t\u0303汉\uD83D\uDCA9\u030C\u0348\u0320'
];

const MERGEABLE = [['js', 'java'], ['utf16', 'utf16-le']];


function randomStr() {
  return SPECIAL_STRINGS[Date.now() % SPECIAL_STRINGS.length];
}


function parseArgvToStr(argv) {
  let str = '';

  argv._.forEach(arg => {
    arg = arg.toString();
    arg = arg
        .replace(/[\\]*u(\{?[\da-f]{4,7})\}?/ig, (r, code) => {
          return String.fromCodePoint(parseInt(code, 16));
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
  let gs = ['system', 'fe', 'lang'], index;
  let gap = 20;

  for (let i = 0; i < gs.length; i++) {
    index = GROUPS[gs[i]].indexOf(encoding);
    if (index >= 0) return i * gap + i + index;
  }

  return encoding.replace(/-.*$/, '-').match(/\d+|[\w!]/g).reduce((memo, c, index) => {

    if (/\d/.test(c)) memo += parseInt(c, 10) * 2; // 保证 utf7 到 utf8 之间还能有其它编码，如 utf7-imap
    else memo += c.codePointAt(0) * 1000; // 保证字母的权重不落后于数字

    if (c === '-') memo += 1; // - 是为了使类似于 utf7 utf7-imap utf8 按此顺序排，而不是 utf7 utf8 utf7-imap
    else memo += index * 500; // 500 是保证编码排序字母越在前面，权重越大

    return memo;

  }, gap * gs.length);
}

function getColumns (argv, GROUPS) {
  let columns = ['codePoint'],
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

  columns.push('ambiguous', 'size', 'block');

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

export default function (argv, GROUPS) {

  let str = parseArgvToStr(argv);
  if (!str) str = randomStr();

  Detector.detectEach(str, function (err, all) {
    if (err) throw err;

    let chars = all.map(c => new Char(c.number));

    outputCharsList(chars, mergeColumns(getColumns(argv, GROUPS)), argv);

    console.log(chalk.bold('\n\n   组合结果：') + chalk.green(str), '\n');
  });
}

function outputCharsList(chars, columns, argv) {

  columns.unshift('Nr.', 'symbol');

  let charKeyMap = {'Nr.': 'number'};

  let data = chars.map(c => {
    let char = new Char(c.number);
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
}
