import {data as triggers} from '../../data/css-triggers/chromium';
import chalk from 'chalk';
import tw from 'tty-wrap';
import {fg, u, l} from '../lib/color';

const LAYOUT_COLOR = '#928AE4',
  PAINT_COLOR = '#84AB65',
  COMPOSITE_COLOR = '#376016',
  NOT_WORK_COLOR = '#E5E5E5',

  TRIGGER = '✔',
  // NOT_TRIGGER = '✘',
  NOT_TRIGGER = ' ',
  NOT_WORK = chalk.gray(' ');



const TIPS = {
  '111': 'Changing {key} alters the geometry of the element. That means that it may affect the position or size of other elements on the page, both of which require the browser to perform {layout} operations.\nOnce those layout operations have completed any damaged pixels will need to be {painted} and the page must then be {composited} together.',
  '011': 'Changing {key} does not trigger any geometry changes, which is good. But since it is a visual property, it will cause {painting} to occur. Painting is typically a super expensive operation, so you should be cautious.\nOnce any pixels have been painted the page will be {composited} together.',
  '001': 'Changing {key} does not trigger any geometry changes or painting, which is very good. This means that the operation can likely be carried out by the {compositor thread} with the help of the GPU.',
  '000': 'Changing {key} alters the geometry of the element. That means that it may affect the position or size of other elements on the page, both of which require the browser to perform {layout} operations.\nOnce those layout operations have completed any damaged pixels will need to be {painted}, although in this case not immediately (it doesn\'t trigger paint) and the page must then be {composited} together.'
};

export default function (yargs) {
  let argv = yargs.usage('$0 csstriggers [keywords]\n\n' +
    '    A GAME OF LAYOUT, PAINT, AND COMPOSITE')
    .options({
      match: {
        alias: 'm',
        desc: '精确匹配，而不是模糊匹配',
        type: 'boolean'
      },
      sort: {
        alias: 's',
        desc: '指定排序规则',
        type: 'string',
        choices: ['alpha', 'initial', 'change'],
        'default': 'alpha',
        requiresArg: true
      },
      reverse: {
        alias: 'r',
        desc: '翻转列表',
        type: 'boolean'
      },
    })
    .help('help').alias('h', 'help')
    .argv;


  // 整理数据
  let data = {};
  Object.keys(triggers).forEach(key => {
    let type, attr;

    ['-initial', '-change'].some(suffix => {
      if (key.endsWith(suffix)) {
        type = suffix.slice(1);
        attr = key.slice(0, - suffix.length);
      }
    });

    if (type && attr) {
      if (!data[attr]) data[attr] = {};
      data[attr][type] = triggers[key];
    }
  });



  // 过滤数据，并生成表格
  let keywords = argv._.slice(1).map(arg => arg.toLowerCase());
  let rows = [];
  let brush = (layout, paint, composite) => {
    return fg(layout, LAYOUT_COLOR) + ' ' + fg(paint, PAINT_COLOR) + ' ' + fg(composite, COMPOSITE_COLOR);
  };

  Object.keys(data).forEach(key => {
    let item, attr = data[key];
    if (!keywords.length || keywords.some(kw => argv.match ? key === kw : key.indexOf(kw) >= 0)) {
      item = {};
      item.KEY = key;
      ['initial', 'change'].forEach(type => {
        if (type in attr) {
          item[type.toUpperCase()] = brush(
            attr[type].layout ? TRIGGER : NOT_TRIGGER,
            attr[type].paint ? TRIGGER : NOT_TRIGGER,
            attr[type].composite ? TRIGGER : NOT_TRIGGER
          );
        } else {
          item[type.toUpperCase()] =  brush(NOT_WORK, NOT_WORK, NOT_WORK);
        }
      });
      rows.push(item);
    }
  });


  // sort
  let attrToValue = (attr) => {
    if (!attr) return 0;
    return (attr.composite ? 1 : 0) + (attr.paint ? 10 : 0) + (attr.layout ? 100 : 0);
  };

  rows.sort((a, b) => {
    let aKey = a.KEY, bKey = b.KEY;
    let aAttr = data[aKey], bAttr = data[bKey];
    let sort = argv.sort;
    let result;

    if (sort === 'alpha') result = aKey.charCodeAt(0) - bKey.charCodeAt(0);
    else result = attrToValue(aAttr[sort]) - attrToValue(bAttr[sort]);

    return argv.reverse ? (0 - result) : result;
  });

  console.log('\n   ', brush('LAYOUT', 'PAINT', 'COMPOSITE'));
  console.log(tw.table(
    rows,
    {
      left: 3,
      showHead: true
    },
    {
      head: {
        color: 'bold',
        padding: '1'
      },
      colKEY: {
        color: 'green'
      },
      colCHANGE: {
        paddingLeft: 6
      }
    }
  ), '\n');


  if (rows.length === 1) {
    let tip, a = data[rows[0].KEY].initial;
    if (a) {
      tip = TIPS[(a.layout ? '1' : '0') + (a.paint ? '1' : '0') + (a.composite ? '1' : '0')];
      if (tip) {
        tip = tip.replace(/\{(.*?)\}/g, (r, word) => {
          if (word === 'layout') return fg(word, LAYOUT_COLOR);
          if (word === 'painted') return fg(word, PAINT_COLOR);
          if (word === 'composited') return fg(word, COMPOSITE_COLOR);
          if (word === 'key') word = rows[0].KEY;
          return chalk.bold(word);
        });
        console.log(tw.cell(tip, {left: 4, right: 4}).text);
      }
    }
  }


  console.log(`
    ${l('参考：')}
      1. ${u('http://csstriggers.com/')}
      2. ${u('http://jankfree.org/')}
      3. ${u('http://melonh.com/sharing/slides.html?file=high_performance_animation#/43')}
      4. z-index 引起生成额外的 composited layer：${u('http://output.jsbin.com/efirip/5/quiet')}
      5. 渲染性能：${u('https://developers.google.com/web/fundamentals/performance/rendering/?hl=zh-cn')}
      6. How browsers wrok：${u('http://taligarsiel.com/Projects/howbrowserswork1.htm')}
  `)

}
