import Char from '../lib/Char';
import chalk from 'chalk';

import base from './base';
import {glyph as glyphs} from './data';

export default function (yargs) {

  let opts = base.makeYargsOpts();
  opts.summary.default = false;

  let argv = yargs.usage('$0 space \n\n' +
    '    常用的 Unicode 字符')
    .options(opts)
    .help('help').alias('h', 'help')
    .argv;

  let chars = glyphs.map(s => {
    let c = new Char(s[0]);
    c.name = s[1];
    return c;
  });

  argv.columnsFilter = function (columns) {
    columns.splice(columns.indexOf('symbol') + 1, 0, 'name');
    return columns;
  };

  let u = (str) => chalk.cyan(str); // for url
  let t = (str) => chalk.green(str); // for title
  let l = (str) => chalk.bold(str); // for label

  base.parseCharsToTable(chars, argv, () => {
    console.log(`
    ${t('参考：')}
    ${u('https://medium.com/inside/my-favourite-glyphs-601374889045')}

    ${l('Pilcrow : ')}when I want to start a new paragraph and I physically can’t.
        ¶ This would be a good example. ${u('http://en.wikipedia.org/wiki/Pilcrow')}
    `);
  });
}
