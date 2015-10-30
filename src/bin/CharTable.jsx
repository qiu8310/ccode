import ttyTextSize from 'tty-text-size';
import ttyDetect from 'tty-detect';
import punycode from 'punycode';
import iconv from 'iconv-lite';
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

const COLUMNS_MERGEABLE = [['js', 'java'], ['utf16', 'utf16-le']];

const COLUMNS_GROUP = {
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

const COLUMNS_MAP = {
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
    alias: ['es'],
    desc: '根据指定的语言转义输入的字符',
    choices: columnGroups.lang,
    type: 'array',
    requiresArg: true
  },
  highlights: {
    alias: ['hs'],
    desc: '高亮指定的列',
    type: 'array',
    requiresArg: true
  },
  highlightColor: {
    alias: 'hc',
    'default': 'bgYellow.white',
    desc: '指定高亮的颜色',
    type: 'string',
    requiresArg: true
  },
  detect: {
    desc: '是否使用 ansi 技术检查每个字符在终端上的长度',
    type: 'boolean'
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



class CharTable {}



