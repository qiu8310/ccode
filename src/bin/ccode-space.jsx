import Char from '../lib/Char';
import chalk from 'chalk';

import base from './base';
import {space as spaces} from './data';

export default function (yargs) {

  let opts = base.makeYargsOpts();
  opts.summary.default = false;
  opts.desc = {
    desc: '显示出使用此空格字符的详细信息',
    type: 'boolean'
  };

  let argv = yargs.usage('$0 space \n\n' +
    '    Unicode 中的各种空格，及它在网站上的妙用')
    .options(opts)
    .help('help').alias('h', 'help')
    .argv;

  let chars = spaces.map(s => {
    let c = new Char(s[0]);
    c.name = s[1].replace(' $ ', ' _' + chalk.bgYellow(c.symbol) + '_ ');
    return c;
  });


  argv.columnsFilter = function (columns) {
    columns[columns.indexOf('symbol')] = 'name';
    return columns;
  };


  let u = (str) => chalk.cyan(str); // for url
  let t = (str) => chalk.green(str); // for title
  let l = (str) => chalk.bold(str); // for label

  base.parseCharsToTable(chars, argv, () => {
    console.log(`
    终端上效果不明显，查看详情移步  ${u('http://www.smashingmagazine.com/2015/10/space-yourself/#all-together-now')}
    WIKI:【 Whitespace Character 】 ${u('https://en.wikipedia.org/wiki/Whitespace_character')}
    `);

    if (!argv.desc) return ;

    console.log(`
    ${t('使用说明：')}
      ${l('1. Using breakable space:')}
        由于它们有不同的宽度，所以可以添加在某些字符的两端，适当的撑开此字符，使布局更美观

      ${l('2. Using no-break space:')}
        它们默认是无法被自动断开的，浏览器在自动换行时，不会在这些 space 上换行，所以当你不
        想要浏览器拆分某些字符时，可以在它们之间用这些 space 连接起来

      ${l('3. Using zero-width space:')}
        和 no-break space 相反，浏览器会在这些字符上换行，所以可以不用 css 的 break-word 而使用此
        来使文本在某些连接在一起的地方可以自动换行

        另外它还可以扰乱默认的算法，比如某些应用程序会使用 @someone 来推送一个消息给 someone，但
        如果 @ 和 someone 之间有一个 zero-width space 的话，那此应用程序是不会推送消息的（除非
        它过滤了这种空白字符）

    ${t('注意事项：')}
      1. 因为这些空白字符看上去是一样的，所以在使用它时要写上注释
      2. 不同的字体对这些字符的支持度是不一样的，有些字体可能不支持此类字符
    `);
  });
}
