#!/usr/bin/env node

require('es6-shim');

import yargs from 'yargs-cn';
import base from './base';

var CMD;

const CMDS = {
  block: '获取 Unicode Blocks 相关信息',
  encoding: '查看所有支持的编码',
  priority: '显示不同语言的运算符的优先级',
  space: 'Unicode 中的各种空格，及它在网站上的秒用'
}


function subCommand(type) {
  return function (yargs) {
    CMD = type;
    require('./ccode-' + type)(yargs);
  };
}

let argv = yargs.usage('$0 [command] [options]\n\n' +
    '    03FD, u03FD, \\u03FD, u{533FD} 类型的数据会自动当作 Unicode 编码来处理;\n' +
    '    0x41, 0X4A2F 类型的数据会当作 16 进制，然后转化成对应的 Unicode;\n' +
    '    2-100, 0x100-0x130 会当作一个区间，并计算区间内的每个字符的属性;')

    .completion('completion', '生成 Bash 自动被全脚本', function(current, argv) {
      let all = Object.keys(CMDS);
      if (current === 'ccode' || current === 'cc') return all;
      return all.concat('completion').filter(cmd => cmd.indexOf(current) === 0);
    });

    Object.keys(CMDS).forEach(cmd => argv.command(cmd, CMDS[cmd], subCommand(cmd)));

    argv = argv.version(require('../../package.json').version).alias('v', 'version')
    .options(base.makeYargsOpts())
    .help('help').alias('h', 'help')
    .showHelpOnFail(false, '请使用 --help 查看可用的选项')
    .argv;


if (!CMD) {
  base.parseArgvToTable(argv);
}

