'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

var _ttyWrap = require('tty-wrap');

var _ttyWrap2 = _interopRequireDefault(_ttyWrap);

var _punycode = require('punycode');

var _punycode2 = _interopRequireDefault(_punycode);

var _libChar = require('../lib/Char');

var _libChar2 = _interopRequireDefault(_libChar);

var _libHelper = require('../lib/Helper');

var _libHelper2 = _interopRequireDefault(_libHelper);

var _ttyText = require('tty-text');

var _ttyText2 = _interopRequireDefault(_ttyText);

var _dataCodepages = require('../../data/codepages');

var _dataCodepages2 = _interopRequireDefault(_dataCodepages);

var chalk = _ttyWrap2['default'].chalk;
var LAST_NUMBER = _libHelper2['default'].RESOURCES.LAST_NUMBER;

var SPECIAL_STRINGS = ['Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', '깍♡\t̃汉💩͈̠̌'];

function randomStr() {
  return SPECIAL_STRINGS[Date.now() % SPECIAL_STRINGS.length];
}

function parseArgvToStr(argv) {
  var str = '';

  argv._.forEach(function (arg) {
    arg = arg.toString();
    arg = arg.replace(/[\\]*u(\{?[\da-f]{4,7})\}?/ig, function (r, code) {
      return String.fromCodePoint(parseInt(code, 16));
    }).replace(/0x[\da-f]{1,7}/ig, function (r) {
      return parseInt(r, 16).toString();
    });

    if (/^\d+(\-\d+)?$/.test(arg)) {
      var _arg$split$map = arg.split('-').map(Number);

      var _arg$split$map2 = _slicedToArray(_arg$split$map, 2);

      var from = _arg$split$map2[0];
      var to = _arg$split$map2[1];

      if (to == null) to = from;
      from -= argv.before;
      to += argv.after;

      var codes = [],
          i = undefined;
      for (i = from; i <= to; i++) if (i <= LAST_NUMBER) codes.push(i);

      str += _punycode2['default'].ucs2.encode(codes);
    } else {
      str += arg;
    }
  });

  return str;
}

function getColumns(argv, GROUPS) {
  var columns = ['codePoint'],
      char = new _libChar2['default'](100);

  ['include', 'exclude'].forEach(function (k) {
    return argv[k] = argv[k] || [];
  });

  var groups = (argv.group || ['default']).map(function (g) {
    return GROUPS[g];
  });
  groups.push(argv.include);

  columns = groups.reduce(function (memo, group) {
    group.forEach(function (k) {
      if (memo.indexOf(k) < 0) memo.push(k);
    });
    return memo;
  }, columns);

  columns.push('isAmbiguous', 'size', 'block');

  return columns.filter(function (k) {
    return argv.exclude.indexOf(k) < 0 && (k in char || _dataCodepages2['default'].indexOf(k) >= 0);
  });
}

exports['default'] = function (argv, GROUPS) {

  var str = parseArgvToStr(argv);
  if (!str) str = randomStr();

  _ttyText2['default'].detectEach(str, function (err, all) {
    if (err) throw err;

    var chars = all.map(function (c) {
      return new _libChar2['default'](c.number);
    });

    outputCharsList(chars, getColumns(argv, GROUPS), argv);

    console.log(chalk.bold('\n\n   组合结果：') + chalk.green(str), '\n');
  });
};

function outputCharsList(chars, columns, argv) {

  columns.unshift('Nr.', 'symbol');

  var data = chars.map(function (c) {
    var char = new _libChar2['default'](c.number);
    return columns.reduce(function (memo, key) {
      var val = undefined;
      if (/cp\d+/.test(key)) val = char.cp(key);else val = char[key === 'Nr.' ? 'number' : key];

      memo[key] = typeof val === 'boolean' ? val ? 'Yes' : 'No' : val;

      return memo;
    }, {});
  });

  console.log(_ttyWrap2['default'].table(data, {
    left: 4,
    showHead: true,
    border: argv.border
  }, {
    head: { color: 'bold.white', padding: '1' },
    colA: { color: 'gray', align: 'right' },
    colIsAmbiguous: { align: 'center' },
    colSize: { align: 'center' },
    colUtf8: { align: 'right' },
    colUtf16: { align: 'right' },
    colUtf32: { align: 'right' },
    colSymbol: { color: 'green', align: 'center' }
  }));
}
module.exports = exports['default'];