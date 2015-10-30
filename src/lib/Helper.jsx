import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import request from 'request';
import Detector from 'tty-detect';
import RESOURCES from './resource';
import chalk from 'chalk';

const FILES = RESOURCES.FILES;
const ROOT_DIR = path.dirname(path.dirname(__dirname));
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DATA_RAW_DIR = path.join(DATA_DIR, 'raw');

function fetchRaw(key, callback, {fetchFromRemote = true, updateLocal = true, filter = true} = {}) {

  if (!(key in FILES)) return callback(new Error('Not found resource key ' + key));

  let remote = FILES[key],
      local = path.join(DATA_RAW_DIR, key);

  let process = (data) => {
    data = data.toString();
    if (!filter) return callback(null, data);
    callback(null, data.split('\n').map(l => l.replace(/#.*$/, '').trim()).filter(l => l));
  };

  if (fetchFromRemote) {
    console.log('Fetch remote resource ' + key + ' from ' + remote + '...');
    request({url: remote, timeout: 6000}, (err, res, body) => {
      if (err || res.statusCode >= 400) {
        console.log('Fetch remote resource error. ' + JSON.stringify(err || {statusCode: res.statusCode}));
        console.log('Fall back to fetch from local file ' + local);
        fs.readFile(local, (err, body) => {
          if (err) return callback(err);
          process(body);
        });
      } else {
        console.log('Fetch remote resource success.');
        if (updateLocal) fs.writeFileSync(local, body);
        process(body);
      }
    });
  } else {
    fs.readFile(local, (err, body) => {
      if (err) return callback(err);
      process(body);
    });
  }
}

function writeData(key, data, pretty = false) {
  let file = path.join(DATA_DIR, key);
  fs.ensureDirSync(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, pretty ? 4 : ''));
}

function readData(key) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, key)).toString());
}

function isDataFileExists(key) {
  return fs.statSync(path.join(DATA_DIR, key)).isFile();
}

function diffBeforeWriteData(key, data) {
  let oldData;
  data = JSON.stringify(data);

  let file = path.join(DATA_DIR, key);

  try { oldData = fs.readFileSync(file).toString(); } catch (e) {}

  if (oldData && data !== oldData) {
    let backupFile = path.join(DATA_DIR, 'backup.' + key);
    console.log('New data is different from old one, backup old data to file ' + backupFile);
    fs.writeFileSync(backupFile, oldData);
  }
  fs.writeFileSync(file, data);
  console.log('Generate "' + key + '" successfully.');
}


function parseHex(hex) { return parseInt(hex, 16); }

function isAmbiguousEnv() { return process.argv.indexOf('--amb') > 0; }

function isAmbiguous(cb) {
  Detector.detectEachNumbers([161], (err, ambs) => {
    if (err) cb(err);
    else cb(null, ambs[0].size === 2);
  });
}


/**
 * 在像 data/han-wb.json 这种文件中查找对应的 code point 所指的值
 * @param  {Array} cpsRange
 * @param  {Number} cp
 * @param  {String} [separate]
 * @return {String}
 */
function findInCompressedRange(cpsRange, cp, separate = '|') {
  let i, range, offset;
  for (i = 0; i < cpsRange.length; i++) {
    range = cpsRange[i];
    offset = cp - range[0];
    if (offset >= 0 && offset <= range[1]) {
      return range[2].split(separate)[offset];
    } else if (offset < 0) {
      return '';
    }
  }
  return '';
}

function brush(str, color) {
  if (!color) return str;
  let ref = chalk;
  color.split('.').forEach(c => ref = ref[c]);
  return ref(str);
}


export default {
  brush,
  isWin: os.platform() === 'win32',
  fetchRaw, writeData, readData, isDataFileExists, diffBeforeWriteData,
  parseHex, RESOURCES, isAmbiguousEnv, isAmbiguous, findInCompressedRange };
