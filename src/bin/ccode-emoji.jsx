import Char from '../lib/Char';
import chalk from 'chalk';

import base from './base';

const emojis = [
  ['1F601', 'grinning face with smiling eyes'],
  ['1F602', 'face with tears of joy'],
  ['1F603', 'smiling face with open mouth'],
  ['1F605', 'smiling face with open mouth and cold sweat'],
  ['1F60A', 'smiling face with smiling eyes'],
  ['1F613', 'face with cold sweat'],
  ['1F624', 'face with look of triumph'],
  ['1F62D', 'loudly crying face'],
  ['1F631', 'face screaming in fear'],
  ['1F639', 'cat face with tears of joy'],
  ['1F63F', 'crying cat face'],
  ['1F648', 'see-no-evil monkey'],
  ['1F649', 'hear-no-evil monkey'],
  ['1F64A', 'speak-no-evil monkey'],
  ['1F44B', 'waving hand'],
  ['1F44C', 'ok hand'],
  ['1F44D', 'thumbs up'],
  ['1F44E', 'thumbs down'],
  ['1F44F', 'clapping hands'],
  ['1F4AA', 'flexed biceps'],
  ['1F600', 'grinning face'],
  ['1F60E', 'cool face'],
  ['1F610', 'neutral face'],
  ['1F611', 'expressionless face'],
  ['1F615', 'confused face'],
  ['1F617', 'kissing face'],
  ['1F619', 'kissing face with smiling eyes'],
  ['1F61F', 'worried face'],
  ['1F62C', 'grimacing face'],
  ['1F634', 'sleeping face']
];

export default function (yargs) {

  let opts = base.makeYargsOpts();
  opts.summary.default = false;

  let argv = yargs.usage('$0 emoji \n\n' +
    '    表情符号')
    .options(opts)
    .help('help').alias('h', 'help')
    .argv;

  let chars = emojis.map(s => {
    let c = new Char(parseInt(s[0], 16));
    c.name = s[1];
    return c;
  });

  argv.columnsFilter = function (columns) {
    columns.splice(columns.indexOf('symbol') + 1, 0, 'name');
    columns.splice(columns.indexOf('cp936'), 1);
    columns.splice(columns.indexOf('ucs2'), 1);
    return columns;
  };

  let u = (str) => chalk.cyan(str); // for url
  let t = (str) => chalk.green(str); // for title
  let l = (str) => chalk.bold(str); // for label

  base.parseCharsToTable(chars, argv, () => {
    console.log(`
    ${t('参考：')}
      ${l('官方文档：')} ${u('http://www.unicode.org/reports/tr51/')}
      ${l('官方数据：')} ${u('http://www.unicode.org/Public/emoji/latest/emoji-data.txt')}
      ${l('不同的系统平台，emoji 表情可能不一样：')} ${u('http://apps.timwhitlock.info/emoji/tables/unicode')}
      ${l('Twitter Emoji for Everyone：')} ${u('http://twitter.github.io/twemoji')}
    `);
  });
}
