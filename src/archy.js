function archy (obj, prefix, opts) {
  if (prefix === undefined) prefix = '';
  if (!opts) opts = {};
  var chr = function (s) {
    var chars = {
      '│' : '|',
      '└' : '`',
      '├' : '+',
      '─' : '-',
      '┬' : '-'
    };
    return s;
  };

  if (typeof obj === 'string') obj = { label : obj };

  var nodes = obj.nodes || [];
  var lines = (obj.label || '').split('\n');
  var splitter = '\n' + prefix + (nodes.length ? chr('│') : ' ') + ' ';

  return prefix
      + lines.join(splitter) + '\n'
      + nodes.map(function (node, ix) {
        var last = ix === nodes.length - 1;
        var more = node.nodes && node.nodes.length;
        var prefix_ = prefix + (last ? ' ' : chr('│')) + ' ';

        return prefix
            + (last ? chr('└') : chr('├')) + chr('─')
            + (more ? chr('┬') : chr('─')) + ' '
            + archy(node, prefix_, opts).slice(prefix.length + 2)
            ;
      }).join('')
      ;
}
/*
 '│' : '|',
 '└' : '`',
 '├' : '+',
 '─' : '-',
 '┬' : '-'
 */


function arch (obj, prefix, opts) {
  prefix = prefix || '';
  opts = opts || {};

  if (typeof obj === 'string') obj = { label: obj };

  var nodes = obj.nodes || [];
  var lines = (obj.label || '').split('\n');
  var splitter = '\n' + prefix + (nodes.length ? '|' : ' ') + ' ';

  return prefix + lines.join(splitter) + '\n' +
          nodes.map(function (node, i) {

          });
}


var s = arch({
  label : 'beep',
  nodes : [
    'ity',
    'bb'
  ]
});
console.log(s);
