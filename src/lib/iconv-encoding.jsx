import encodings from 'iconv-lite/encodings';


let result = {};

Object.keys(encodings).forEach(key => {

  if (key[0] === '_' || (key in result)) return true;


  let enc = encodings[key], alias, target;

  if (typeof enc === 'string') {
    key = enc;
    alias = key;
    enc = encodings[key];
  }

  result[key] = result[key] || {};
  target = result[key]

  if (alias) {
    target.alias = target.alias || [];
    target.alias.push(alias);
  }

  if (enc.type === '_internal') target.internal = true; // node internal encoding

});




module.exports = result;
