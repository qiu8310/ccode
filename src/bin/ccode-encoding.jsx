import all from '../lib/iconv-encodings';
import ttyWrap from 'tty-wrap';

export default function (yargs) {

  let argv = yargs
    .usage('$0 encoding [keywords]\n\n' +
      '    查看所有支持的编码，\n' +
      '    可以指定一个或多个 keyword 来搜索你想要查看的编码。')
    .help('help').alias('h', 'help')
    .argv;


  let data = [];
  let keywords = argv._.slice(1).map(k => k.toLowerCase().replace(/[^a-z0-9]/, ''));

  Object.keys(all).forEach(key => {
    let enc = all[key];
    let alias = enc.alias || [];

    if (keywords.length) {
      // 没有一个名称包含关键字，忽略此条记录
      if ([key].concat(alias).every(key => keywords.every(kw => key.indexOf(kw) < 0)))
        return true;
    }

    data.push({
      encoding: key,
      internal: enc.internal ? 'Yes' : '',
      alias: alias.join(', ')
    });
  });

  ttyWrap.table(data,
    {
      head: ['Encoding', 'Node Support', 'Alias'],
      showHead: true,
      left: 4,
      right: 10,
      console: 'log'
    },
    {
      head: { color: 'bold.white', padding: '1' },
      colA: { color: 'green', align: 'right' },
      colB: { align: 'center' }
    });

};
