import ttyWrap from 'tty-wrap';
import chalk from 'chalk';

export default function (yargs) {

  let argv = yargs
    .usage('$0 priority <language>\n\n' +
      '    显示不同语言的运算符的优先级。')
    .help('help').alias('h', 'help')
    .argv;

  let tables = {
    meta: {
      map: {
        javascript: 'js'
      },
      js: {
        ref: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence'
      },
      php: {
        note: '对具有相同优先级的运算符，左结合方向意味着将从左向右求值，右结合方向则反之。对于无结合方向具有相同优先级的运算符，该运算符有可能无法与其自身结合。举例说，在 PHP 中 1 < 2 > 1 是一个非法语句，而 1 <= 1 == 1 则不是。因为 T_IS_EQUAL 运算符的优先级比 T_IS_SMALLER_OR_EQUAL 的运算符要低。',
        ref: 'http://cn.php.net/manual/zh/language.operators.precedence.php'
      }
    },
    js: [
      ['', '()', '圆括号'],
      ['l', '. []', '成员访问'],
      ['', 'new ... ( ... )', 'new (带参数列表)'],
      ['l', 'fn()', '函数调用'],
      ['r', 'new ...', 'new (无参数列表)'],
      ['', '++ --', '后置递增、后置递减'],
      ['r', '! ~ + - ++ -- typeof void delete', '逻辑非、按位非、一元加/减、前置递增/减 等'],
      ['l', '* / %', '算术运算符'],
      ['l', '+ -', '算术运算符'],
      ['l', '<< >> >>>', '位运算符'],
      ['l', '< <= > >= in instanceof', '比较运算符'],
      ['l', '== != === !==', '比较运算符'],
      ['l', '&', '位运算符'],
      ['l', '^', '位运算符'],
      ['l', '|', '位运算符'],
      ['', '&&', '逻辑运算符'],
      ['', '||', '逻辑运算符'],
      ['r', '?:', '三元运算符'],
      ['r', '= += -= *= /= %= <<= >>= >>>= &= ^= |=', '赋值运算符'],
      ['r', 'yield', ''],
      ['', '...', 'Spread'],
      ['l', ',', '多个计算'],
    ],
    php: [
      ['', 'clone new', 'clone 和 new'],
      ['l', '[]', 'array'],
      ['r', '++ -- ~ (int) (float) (string) (array) (object) (bool) @', '类型和递增／递减'],
      ['', 'instanceof', ''],
      ['r', '!', '逻辑运算符'],
      ['l', '* / %', '算术运算符'],
      ['l', '+ - .', '算术运算符和字符串运算符'],
      ['l', '<< >>', '位运算符'],
      ['', '== != === !== <>', '比较运算符'],
      ['l', '&', '位运算符和引用'],
      ['l', '^', '位运算符'],
      ['l', '|', '位运算符'],
      ['l', '&&', '逻辑运算符'],
      ['l', '||', '逻辑运算符'],
      ['l', '?:', '三元运算符'],
      ['r', '= += -= *= /= .= %= &= |= ^= <<= >>= =>', '赋值运算符'],
      ['l', 'and', '逻辑运算符'],
      ['l', 'xor', '逻辑运算符'],
      ['l', 'or', '逻辑运算符'],
      ['l', ',', '多个计算']
    ]
  };

  let language = argv._[1];

  if (!language) language = 'js';
  language = tables.meta.map[language] || language;

  if (language === 'meta' || !tables[language]) {
    console.log(chalk.yellow('\n     Not supported language: ' + language + ', auto switch to js.'));
    language = 'js';
  }

  console.log(chalk.bold('\n     ' + language + ' priority:'))

  let data = tables[language];
  let meta = tables.meta[language] || {};

  data.forEach(row => {
    if (row[0] === 'l') row[0] = chalk.cyan('->');
    else if (row[0] === 'r') row[0] = chalk.magenta('<-');
    else row[0] = chalk.gray('--');
    row[1] = chalk.green(row[1]);
  });


  ttyWrap.table(data,
    {
      head: ['结合方向', '运算符', '说明'],
      left: 4,
      right: 10,
      console: 'log'
    },
    {
      head: { color: 'bold.white', padding: '1' },
      colA: { align: 'center' }
    }
  );

  if (meta.note) console.log('\n   ', chalk.gray(meta.note));
  if (meta.ref) console.log('\n   ', '参考 ' + chalk.cyan(meta.ref));
  console.log();
};
