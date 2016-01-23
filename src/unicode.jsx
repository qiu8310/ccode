import Helper from './lib/Helper';

Helper.fetchRaw('UnicodeData.txt', (err, lines) => {

  if (err) throw err;

  let data = {};
  let namesData = {};

  // http://www.ksu.ru/eng/departments/ktk/test/perl/lib/unicode/UCDFF301.html
  let keys =  ['value', 'name', 'category', 'class',
    'bidirectionalCategory', 'mapping', 'decimalDigitValue', 'digitValue',
    'numericValue', 'mirrored', 'unicodeName', 'comment', 'uppercaseMapping',
    'lowercaseMapping', 'titlecaseMapping'];

  lines.forEach(line => {
    let values = line.toString().split(';');
    let i, char = {};
    for(i = 0 ; i < 15 ; i++) char[keys[i]] = values[i];
    data[char.value] = char;
    namesData[char.value] = char.name === '<control>'
      ? char.name + ' | ' + char.unicodeName
      : char.name
  });

  Helper.diffBeforeWriteData('UnicodeData.json', data);
  Helper.diffBeforeWriteData('UnicodeNamesData.json', namesData);

}, {fetchFromRemote: false});
