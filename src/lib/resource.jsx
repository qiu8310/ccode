const LAST_BMP_NUMBER = 0xFFFF;
const LAST_NUMBER = 0x10FFFF;


let ALL_NUMBERS = [];
let BMP_NUMBERS = [];
for (let i = 0; i <= LAST_NUMBER; i++) ALL_NUMBERS[i] = i;
for (let i = 0; i <= LAST_BMP_NUMBER; i++) BMP_NUMBERS[i] = i;

// http://www.unicode.org/Public/MAPPINGS/ISO8859/8859-1.TXT
let FILES = {
  // 美国
  'cp437.txt': 'http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/PC/CP437.TXT',
  // 中国 - 简体中文(GB2312)
  'cp936.txt': 'http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP936.TXT',

  'cp949.txt': 'http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP949.TXT',
  // 繁体中文(Big5)
  'cp950.txt': 'http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP950.TXT',

  'Blocks.txt': 'http://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt',
  'EastAsianWidth.txt': 'http://www.unicode.org/Public/UCD/latest/ucd/EastAsianWidth.txt',

  'UnicodeData.txt': 'http://unicode.org/Public/UNIDATA/UnicodeData.txt'
};


export default {
  LAST_BMP_NUMBER,
  LAST_NUMBER,
  BMP_NUMBERS,
  ALL_NUMBERS,
  FILES
};



