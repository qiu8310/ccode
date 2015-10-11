import Detector from 'tty-text';
import Helper from './lib/Helper';
import Range from './lib/Range';


// 首先检查是否是 ambiguous
Helper.isAmbiguous((err, isAmbEnv) => {

  if (err) throw err;

  if (!isAmbEnv) {
    console.warn('\x1B[33mIf you want to calculate East Asian Ambiguous Character\'s size, ' +
        'make sure you have checked "Treat ambiguous-width characters as double width"' +
        ' in your terminal preferences setting, and run this again.\x1B[m\n');

    console.warn('\x1B[94mMore About East Asian Ambiguous Character on http://unicode.org/reports/tr11/\x1B[m\n');
  }

  let isWin = Helper.isWin;
  let winPrefix = isWin ? 'win-' : '';
  let normalSizeFile = winPrefix + 'size-normal.json';
  let ambiguousSizeFile = winPrefix + 'size-ambiguous.json';
  let diffSizeFile = winPrefix + 'size-diff.json';
  
  // 数据集，及添加到数据集的方法
  let sizeData = {}, oppoSizeData, oppoSizeKeys, diffSizeData;
  let addCharTo = (c, target) => {
    if (!target[c.size]) target[c.size] = new Range();
    target[c.size].add(c.number);
  };

  try {
    oppoSizeData = Helper.readData(isAmbEnv ? normalSizeFile : ambiguousSizeFile);
    diffSizeData = {};
    oppoSizeKeys = Object.keys(oppoSizeData);
    oppoSizeKeys.forEach(k => oppoSizeData[k] = new Range(oppoSizeData[k]));
  } catch (e) {}

  
  Detector.detectEachNumbers(Helper.RESOURCES.ALL_NUMBERS, (err, all) => {
    if (err) throw err;

    all.forEach(c => {
      let s = c.size;
      // 忽略 \b 和 \n
      if (c.number === 8 || c.number === 10) return true;

      if (s !== 1) { // 不记录长度是 1 的字符
        addCharTo(c, sizeData);
        if (oppoSizeData && (!oppoSizeData[s] || !oppoSizeData[s].contains(c.number)))
          addCharTo(c, diffSizeData);
      } else if (oppoSizeData) {
        if (oppoSizeKeys.some(k => oppoSizeData[k].contains(c.number)))
          addCharTo(c, diffSizeData);
      }
    });

    if (diffSizeData && isAmbEnv)
      Helper.diffBeforeWriteData(diffSizeFile, diffSizeData);
  
    Helper.diffBeforeWriteData(isAmbEnv ? ambiguousSizeFile : normalSizeFile, sizeData);
  
  });

});


