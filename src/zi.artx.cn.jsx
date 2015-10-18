import request from 'request';
import async from 'async';
import os from 'os';
import Helper from './lib/Helper';

let rangeKey = ['bmp', 'sp'].indexOf(process.argv[2]) < 0 ? 'test' : process.argv[2];
let ranges = {
  test: [
    [0x4E00, 0x4E10]   // test
  ],
  bmp: [
    [0x2E80, 0x2EFF],  // CJK Radicals Supplement                   128
    [0x3400, 0x4DBF],  // CJK Unified Ideographs Extension A        6592
    [0x4E00, 0x9FFF],  // CJK Unified Ideographs                    20992
    [0xF900, 0xFAFF]   // CJK Compatibility Ideographs              512
  ],
  sp: [
    [0x20000, 0x2A6DF],// CJK Unified Ideographs Extension B        42720
    [0x2F800, 0x2FA1F] // CJK Compatibility Ideographs Supplement   544
  ]
}

let base = 'http://zi.artx.cn/zi/search/?dsearch_kind=1&dsearch_kind2=on&dsearch_main=';
let cps = ranges[rangeKey].reduce((memo, range) => {
  for (let i = range[0]; i <= range[1]; i++) memo.push(i);
  return memo;
}, []);

let rTarget = /\u90E8\u9996\u7684\u6C49\u5B57\u5217\u8868\u5F00\u59CB-->[\s\S]*?\/zi\/ArtX(\w+)\.html/;
let rInfo = /<div class="zi_t_2">([\s\S]*?)<\/td>/;
let regs = {
  a: />\u62FC\u97F3\uFF1A\s*(.*?)\s*</,  // 拼音
  b: />\u4E94\u7B14\uFF1A\s*(.*?)\s*</,  // 五笔
  c: />\u90E8\u9996\uFF1A\s*(.*?)\s*</,  // 部首
  d: />\u603B\u7B14\u5212\uFF1A\s*(.*?)\s*</,  // 总笔划
  e: />\u6CE8\u97F3\uFF1A\s*(.*?)\s*</  // 注音
};

let errors = [];
let total = cps.length;

function iterator (cp, done) {

  let url;
  let result = {cp};
  let errorCallback = () => {
    errors.push(cp);
    console.log('request %o error, code point %o, ignored.', url, cp);
    result.error = true;
    done(null, result); // 请求错误也要走完来
  };

  url = base + encodeURIComponent(String.fromCodePoint(cp));

  request({url}, (err, res, body) => {

    if (err) return errorCallback();

    if (rTarget.test(body)) {
      result.id = RegExp.$1;

      total--;
      url = 'http://zi.artx.cn/zi/ArtX' + result.id + '.html';
      console.log('  remain %d, request %s ... ', total, url);
      request({url}, (err, res, body) => {
        if (err) return errorCallback();

        if (rInfo.test(body)) {
          let info = RegExp.$1;

          done(null, Object.keys(regs).reduce((res, k) => {
            if (regs[k].test(info) && RegExp.$1) res[k] = RegExp.$1;
            return res;
          }, result));

        } else {
          done(null, result);
        }
      });
    } else {
      done(null, result);
    }
  });
}


function finish (err, cps) {
  let result = cps.reduce((res, it) => {
    let key = it.cp.toString(36);
    delete it.cp;
    res[key] = it;
    return res;
  }, {});

  Helper.writeData('zi/' + rangeKey + '-raw.json', result);

  if (errors.length) {
    console.log('\n\n  总共有 ' + errors.length + ' 个请求错误\n');
    Helper.writeData('zi/' + rangeKey + '-raw-errors.json', errors);
  } else {
    console.log('\n\n  All done!\n');
  }
}


async.mapLimit(cps, os.cpus().length * 3, iterator, finish);
