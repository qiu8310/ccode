'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _ttyText = require('tty-text');

var _ttyText2 = _interopRequireDefault(_ttyText);

var _resource = require('./resource');

var _resource2 = _interopRequireDefault(_resource);

var FILES = _resource2['default'].FILES;
var ROOT_DIR = _path2['default'].dirname(_path2['default'].dirname(__dirname));
var DATA_DIR = _path2['default'].join(ROOT_DIR, 'data');
var DATA_RAW_DIR = _path2['default'].join(DATA_DIR, 'raw');

function fetchRaw(key, callback) {
  var _ref = arguments[2] === undefined ? {} : arguments[2];

  var _ref$fetchFromRemote = _ref.fetchFromRemote;
  var fetchFromRemote = _ref$fetchFromRemote === undefined ? true : _ref$fetchFromRemote;
  var _ref$updateLocal = _ref.updateLocal;
  var updateLocal = _ref$updateLocal === undefined ? true : _ref$updateLocal;
  var _ref$filter = _ref.filter;
  var filter = _ref$filter === undefined ? true : _ref$filter;

  if (!(key in FILES)) return callback(new Error('Not found resource key ' + key));

  var remote = FILES[key],
      local = _path2['default'].join(DATA_RAW_DIR, key);

  var process = function process(data) {
    data = data.toString();
    if (!filter) return callback(null, data);
    callback(null, data.split('\n').map(function (l) {
      return l.replace(/#.*$/, '').trim();
    }).filter(function (l) {
      return l;
    }));
  };

  if (fetchFromRemote) {
    console.log('Fetch remote resource ' + key + ' from ' + remote + '...');
    (0, _request2['default'])({ url: remote, timeout: 6000 }, function (err, res, body) {
      if (err || res.statusCode >= 400) {
        console.log('Fetch remote resource error. ' + JSON.stringify(err || { statusCode: res.statusCode }));
        console.log('Fall back to fetch from local file ' + local);
        _fsExtra2['default'].readFile(local, function (err, body) {
          if (err) return callback(err);
          process(body);
        });
      } else {
        console.log('Fetch remote resource success.');
        if (updateLocal) _fsExtra2['default'].writeFileSync(local, body);
        process(body);
      }
    });
  } else {
    _fsExtra2['default'].readFile(local, function (err, body) {
      if (err) return callback(err);
      process(body);
    });
  }
}

function writeData(key, data) {
  _fsExtra2['default'].writeFileSync(_path2['default'].join(DATA_DIR, key), JSON.stringify(data));
}

function readData(key) {
  return JSON.parse(_fsExtra2['default'].readFileSync(_path2['default'].join(DATA_DIR, key)).toString());
}

function isDataFileExists(key) {
  return _fsExtra2['default'].statSync(_path2['default'].join(DATA_DIR, key)).isFile();
}

function diffBeforeWriteData(key, data) {
  var oldData = undefined;
  data = JSON.stringify(data);

  var file = _path2['default'].join(DATA_DIR, key);

  try {
    oldData = _fsExtra2['default'].readFileSync(file).toString();
  } catch (e) {}

  if (oldData && data !== oldData) {
    var backupFile = _path2['default'].join(DATA_DIR, 'backup.' + key);
    console.log('New data is different from old one, backup old data to file ' + backupFile);
    _fsExtra2['default'].writeFileSync(backupFile, oldData);
  }
  _fsExtra2['default'].writeFileSync(file, data);
  console.log('Generate "' + key + '" successfully.');
}

function parseHex(hex) {
  return parseInt(hex, 16);
}

function isAmbiguousEnv() {
  return process.argv.indexOf('--amb') > 0;
}

function isAmbiguous(cb) {
  _ttyText2['default'].detectEachNumbers([161], function (err, ambs) {
    if (err) cb(err);else cb(null, ambs[0].size === 2);
  });
}

exports['default'] = {
  isWin: _os2['default'].platform() === 'win32',
  fetchRaw: fetchRaw, writeData: writeData, readData: readData, isDataFileExists: isDataFileExists, diffBeforeWriteData: diffBeforeWriteData,
  parseHex: parseHex, RESOURCES: _resource2['default'], isAmbiguousEnv: isAmbiguousEnv, isAmbiguous: isAmbiguous };
module.exports = exports['default'];