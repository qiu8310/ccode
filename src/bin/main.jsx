import tw from 'tty-wrap';
import punycode from 'punycode';
import Char from '../lib/Char';
import Helper from '../lib/Helper';
import Detector from 'tty-text';
import CodePages from '../../data/codepages';

const chalk = tw.chalk;
const LAST_NUMBER = Helper.RESOURCES.LAST_NUMBER;

const SPECIAL_STRINGS = [
  'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞',
  '\u1101\u1161\u11a8\u2661\t\u0303汉\uD83D\uDCA9\u030C\u0348\u0320'
];


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

  columns.push('isAmbiguous', 'size', 'block');

  return columns.filter(k => argv.exclude.indexOf(k) < 0 && ((k in char) || CodePages.indexOf(k) >= 0));
}

export default function (argv, GROUPS) {

  let str = parseArgvToStr(argv);
  if (!str) str = randomStr();

  Detector.detectEach(str, function (err, all) {
    if (err) throw err;

    let chars = all.map(c => new Char(c.number));

    outputCharsList(chars, getColumns(argv, GROUPS), argv);

    console.log(chalk.bold('\n\n   组合结果：') + chalk.green(str), '\n');
  });
}

function outputCharsList(chars, columns, argv) {

  columns.unshift('Nr.', 'symbol');

  let data = chars.map(c => {
    let char = new Char(c.number);
    return columns.reduce((memo, key) => {
      let val;
      if (/cp\d+/.test(key)) val = char.cp(key);
      else val = char[key === 'Nr.' ? 'number' : key];

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
        colIsAmbiguous: { align: 'center' },
        colSize: { align: 'center' },
        colUtf8: { align: 'right' },
        colUtf16: { align: 'right' },
        colUtf32: { align: 'right' },
        colSymbol: { color: 'green', align: 'center' }
      }
  ));
}
