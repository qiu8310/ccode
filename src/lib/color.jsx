import chalk from 'chalk';

const PREFIX = '\x1b[',
  SUFFIX = 'm';


/**
 * Turns rgb 0-5 values into a single ANSI color code to use.
 */
function rgb5 (r, g, b) {
  var red = Math.round(r),
    green = Math.round(g),
    blue = Math.round(b);
  return 16 + (red * 36) + (green * 6) + blue;
}

/**
 * Accepts a hex CSS color code string (# is optional) and
 * translates it into an Array of 3 RGB 0-255 values, which
 * can then be used with rgb().
 */
function hexToRgb5 (color) {
  let c = color[0] === '#' ? color.substring(1) : color,
    r = c.substring(0, 2),
    g = c.substring(2, 4),
    b = c.substring(4, 6);
  return rgb5(
    parseInt(r, 16) / 255 * 5,
    parseInt(g, 16) / 255 * 5,
    parseInt(b, 16) / 255 * 5
  );
}



function color (str, code, bold = true) {
  bold = bold ? (PREFIX + '1' + SUFFIX) : '';
  return PREFIX + code + SUFFIX + bold + str + PREFIX + 0 + SUFFIX;
}

function fg (str, hex, bold) {
  return color(str, '38;5;' + hexToRgb5(hex), bold);
}
function bg (str, hex, bold) {
  return color(str, '48;5;' + hexToRgb5(hex), bold);
}

let u = (str) => chalk.cyan(str); // for url
let t = (str) => chalk.green(str); // for title
let l = (str) => chalk.bold(str); // for label


export default {fg, bg, u, t, l};
