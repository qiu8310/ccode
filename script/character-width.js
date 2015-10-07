var detector = require('../src/detector');
var basic = require('./basic');
var fs = require('fs');
var path = require('path');
var request = require('request');

var dataRoot = path.join(path.dirname(__dirname), 'data');

function _write(name, data) {
  var file = path.join(dataRoot, name + '.json');
  fs.writeFileSync(file, JSON.stringify(data));
  console.log('>> Write to ' + file + ' ok !');
}


/**
 * 使用前，一定要先将东亚模糊字体的宽度设置成 1
 */
function calculateZeroAndDouble (callback) {
  detector.detectEachCodePoints(basic.cps.all, function (err, result) {

    if (err) throw err;

    var data = {
      zero: { size: 0 },
      double: { size: 2 },
      'large-then-two': { }
    };
    var keys = Object.keys(data);
    keys.forEach(function (key) {
      data[key].start = null;
      data[key].end = null;
      data[key].ranges = [];
    });

    var finish = function (target) {
      if (target.start !== null) {
        if (target.end === null) target.ranges.push([target.start]);
        else target.ranges.push([target.start, target.end]);

        target.start = null;
        target.end = null;
      }
    };

    var write = function (type) {
      keys.forEach(function (key) {
        finish(data[key]);
        if (callback) {
          callback(key, type, data[key].ranges);
        } else {
          _write(key + '-width-in-' + type, data[key].ranges);
        }

      });
    };

    result.forEach(function (charProp) {
      var cp = charProp.codePoint;

      keys.forEach(function (key) {
        var target = data[key];
        var match = charProp.size === target.size || (!('size' in target) && charProp.size > 2);

        // ignore 10 => \n, 11 => \v, 12 => \f, 13 => \r
        if (match && (cp < 10 || cp > 13)) {
          if (target.start === null) target.start = cp;
          else target.end = cp;
        } else {
          finish(target);
        }
      });

      if (cp === basic.lastBNFCharCodePoint) {
        write('bnf');
      }
    });

    write('all');
  });
}

function calculateAmbiguous(callback) {
  var url = 'http://www.unicode.org/Public/UCD/latest/ucd/EastAsianWidth.txt';
  console.log('正在从 ' + url + ' 请求数据...');
  request({url: url, timeout: 5000}, function (err, res, body) {
    if (err) {
      console.log(err);
      console.log('从远程请求数据失败，转到取本地备份的数据...');
      body = fs.readFileSync(path.join(dataRoot, 'raw', 'east-asian-width.txt')).toString();
    }
    _processAmbiguousContent(body, callback);
  });
}

function _processAmbiguousContent (content, callback) {
  var ranges = [];
  content.split('\n')
      .map(txtLineMap)
      .forEach(function (line) {
        if (line) {
          var range, parts = line.split(';');
          if (parts[1] === 'A') {
            range = parts[0].split('..').map(parseHex);
            ranges.push(range);
          }
        }
      });
  if (callback) {
    callback('ambiguous', 'all', ranges);
  } else {
    _write('ambiguous-width-in-all', ranges);
  }
}

function calculateBlocks() {
  var ranges = [], blocks = [];
  fs.readFileSync(path.join(dataRoot, 'raw', 'blocks.txt')).toString().split('\n')
      .map(txtLineMap)
      .forEach(function (line) {
        if (line) {
          var p = line.split('; ');
          ranges.push(p[0].split('..').map(parseHex));
          blocks.push(p[1])
        }
      });

  _write('blocks', {ranges: ranges, blocks: blocks});
}


function txtLineMap(line) { return line.trim().replace(/#.*$/, '').trim(); }
function parseHex(n) { return parseInt(n, 16); }

module.exports = {
  calculateZeroAndDouble: calculateZeroAndDouble,
  calculateAmbiguous: calculateAmbiguous,
  calculateBlocks: calculateBlocks
};

calculateBlocks();
