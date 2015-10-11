import Helper from './lib/Helper';
import Range from './lib/Range';
import async from 'async';

let res = Helper.RESOURCES.FILES;
let cps = [];

async.eachSeries(
    Object.keys(res).filter(k => k.indexOf('cp') === 0),
    (k, next) => {
      let cpKey = k.replace(/.\w+$/, '');

      Helper.fetchRaw(k, (err, lines) => {
        if (err) return next(err);

        cps.push(k.split('.').shift());
        let data = {};
        let range = [];

        lines.forEach(l => {
          let [cp, uni] = l.split(/\s+/);
          if (uni) {
            cp = Helper.parseHex(cp);
            uni = Helper.parseHex(uni);
            data[uni] = cp;
            range.push(uni);
          }
        });

        range = Range.fromNumbers(range);
        Helper.diffBeforeWriteData(cpKey + '-range.json', range);
        Helper.diffBeforeWriteData(cpKey + '.json', data);
        console.log();
        next();

      }, {fetchFromRemote: true});
    },
    (err) => {
      if (err) throw err;
      Helper.writeData('codepages.json', cps);
    }
);
