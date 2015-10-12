
import _ from 'lodash';
import punycode from 'punycode';
import ttyWrap from 'tty-wrap';


const BLOCK = require('../../data/block'),
  BLOCK_NAMES = Object.keys(BLOCK),
  BLOCK_LENGTH = BLOCK_NAMES.length;

let sampleLength = 5;


export default function (yargs) {

  let argv = yargs
    .usage('$0 block <keyword>\n\n' +
      '    所有 Unicode 总共分成了 ' + BLOCK_LENGTH + ' 个 Blocks，\n' +
      '    可以指定 keyword 来搜索你想要查看的 Blocks，\n' +
      '    也可以指定下面的参数来查看某段范围内的 Blocks。')
    .help('help').alias('h', 'help')
    .options({
      begin: {
        alias: 'b',
        type: 'string',
        desc: '要查看的 block 的起始位置',
        'default': 0
      },
      end: {
        alias: 'e',
        type: 'string',
        desc: '要查看的 block 的结束位置'
      },
      length: {
        alias: 'l',
        type: 'string',
        desc: '指定要查看的 blcoks 的长度，如果指定了 end，并且 end 比 start 大，则此值无效',
        'default': 10
      },
      sample: {
        alias: 's',
        type: 'string',
        desc: '指定需要取的 sample 的长度',
        'default': 5
      }

    })
    .argv;

  let args = argv._.slice(1).map(arg => arg.toLowerCase()),
    rows = [];

  ['end', 'begin', 'length', 'sample'].forEach(k => {
    if (argv[k] !== null) argv[k] = parseInt(argv[k], 10);
    else argv[k] = 0;
  });
  if (argv.sample > 1) sampleLength = argv.sample;

  if (!args.length) {
    if (!argv.end || argv.end <= argv.begin) argv.end = argv.begin + argv.length;
  }

  for (let i = 0; i < BLOCK_LENGTH; i++) {
    let name = BLOCK_NAMES[i];
    let lower = name.toLowerCase();

    if (args.length && _.some(args, arg => lower.indexOf(arg) >= 0) || !args.length && i >= argv.begin && i < argv.end) {
      rows.push(getBlockRow(name, i));
    }
  }

  console.log(ttyWrap.table(
    rows,
    {
      left: 4,
      showHead: true
    },
    {
      head: { color: 'bold.white', padding: '1' },
      colIndex: { color: 'gray', align: 'center' },
      colBlock: { color: 'green' },
      colSamples: { paddingLeft: '4', color: 'cyan' }
    }
  ), '\n\n');

}

function getBlockRow (name, index) {
  let range = BLOCK[name];
  return {
    Index: index,
    Block: name,
    Range: range[0] + '-' + range[1],
    Samples: getRangeSamples(range)
  }
}

function getRangeSamples (range) {
  let samples = _.sample(_.range(range[0], range[1] + 1), sampleLength);
  let res = [];
  for (let i = 0; i < sampleLength; i++) {
    res.push(samples[i], 32);
  }
  return punycode.ucs2.encode(res);
}


