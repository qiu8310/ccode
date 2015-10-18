#!/usr/bin/env node

require('es6-shim');

import yargs from 'yargs-cn';

var CMD;

function subCommand(type) {
  return function (yargs) {
    CMD = type;
    require('./ccode-' + type)(yargs);
  };
}

const GROUPS = {
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


let argv = yargs.usage('$0 [command] [options]\n\n' +
    '    03FD, u03FD, \\u03FD, u{533FD} 类型的数据会自动当作 Unicode 编码来处理;\n' +
    '    0x41, 0X4A2F 类型的数据会当作 16 进制，然后转化成对应的 Unicode;\n' +
    '    2-100, 0x100-0x130 会当作一个区间，并计算区间内的每个字符的属性;')
    .command('block', '获取 Unicode Blocks 相关信息', subCommand('block'))
    .command('encoding', '查看所有支持的编码', subCommand('encoding'))
    .command('priority', '显示不同语言的运算符的优先级', subCommand('priority'))
    .version(require('../../package.json').version).alias('v', 'version')
    .options({
      include: {
        alias: 'i',
        desc: '添加指定的列，比如：--include php java  # 添加 php, java 的列信息',
        type: 'array'
      },
      exclude: {
        alias: 'e',
        desc: '排除指定的列，比如：--exclude css utf8  # 排除 css, utf8 的列信息',
        type: 'array'
      },
      escape: {
        alias: 'es',
        desc: '根据指定的语言转义输入的字符',
        choices: GROUPS.lang,
        type: 'array',
        requiresArg: true
      },
      group: {
        alias: 'g',
        desc: '选定某个或某几个分组，每个分组里都预定义了一些列',
        choices: Object.keys(GROUPS),
        type: 'array'
      },
      border: {
        alias: 'b',
        desc: '显示表格时添加边框',
        choices: ['simple', 'single', 'double']
      },
      range: {
        alias: 'r',
        desc: '如果指定的参数是一个数字，则会取这个数字前后一段范围的字符，用 -B, -A 来指定前后的数量'
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
    })
    .help('help').alias('h', 'help')
    .showHelpOnFail(false, '请使用 --help 查看可用的选项')
    .argv;


if (!CMD) {
  ['after', 'before'].forEach(k => {
    if (argv[k] === '') argv[k] = 10; // 如果指定为空，则取 10
    else if (typeof argv[k] === 'string') argv[k] = parseInt(argv[k]) || 0;
  });
  require('./main')(argv, GROUPS);
}

