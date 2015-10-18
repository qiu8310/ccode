import bmp from '../data/zi/bmp-raw.json';
import sp from '../data/zi/sp-raw.json';
import Helper from './lib/Helper';
import Range from './lib/Range';

/*

  key: parseInt(key, 36)
  a: 拼音
  b: 五笔
  id: 链接  http://zi.artx.cn/zi/ArtX_____.html

 */

let data = {py: [], wb: [], link: []};
let last = {py: null, wb: null, link: null};
let KEYS = ['py', 'wb', 'link'];

// let range = {py: new Range(), wb: new Range(), link: new Range()};

[bmp, sp].forEach(raw => {

  Object.keys(raw).map(key => parseInt(key, 36)).sort().forEach(cp => {
    let key = cp.toString(36);
    let d = {py: raw[key].a, wb: raw[key].b, link: raw[key].id};

    KEYS.forEach(k => {
      let v = d[k];
      let store = data[k];
      if (v) {
        if (!store.length || last[k] === null || cp - last[k] > 1) {
          store.push([cp, 1, v]);
        } else {
          store[store.length - 1][1] += 1;
          store[store.length - 1][2] += '|' + v;
        }
        // range[k].add(cp);
        last[k] = cp;
      }
    });
  });
});


KEYS.forEach(k => {
  Helper.writeData('han-' + k + '.json', data[k], true);
  // Helper.writeData('zi-range-' + k + '.json', range[k]);
});

console.log('\n  All done!\n');

