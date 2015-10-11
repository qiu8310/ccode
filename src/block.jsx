import Helper from './lib/Helper';

Helper.fetchRaw('Blocks.txt', (err, lines) => {

  if (err) throw err;

  let data = {};

  lines.forEach(l => {

    let [range, name] = l.split(/\s*;\s*/);
    data[name] = range.split('..').map(Helper.parseHex);
    if (data[name].length === 1) data[name].push(data[name][0]);

  });

  Helper.diffBeforeWriteData('block.json', data);

});
