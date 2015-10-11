const MIN_NUMBER = 0,
    MAX_NUMBER = 0x10FFFF;

function includes(range, number) {
  return range[0] <= number && number <= range[1];
}

export default class Range {

  /**
   * Range 构造函数
   * @param {Array<Array>} [ranges]
   */
  constructor(ranges) {
    this._ranges = [];
    if (ranges && ranges.length) {
      ranges.forEach(r => {
        this._ranges.push([r[0], r[1] || r[0]]);
      });
    }
  }

  /**
   * @param {Array<Number>} numbers
   */
  static fromNumbers(numbers) {
    let r = new Range();
    numbers.sort((a, b) => a - b).forEach(n => r.add(n));
    return r;
  }

  /**
   * 获取当前范围内的数字的总数
   * @returns {number}
   */
  get count() {
    let i = 0;
    this.eachSubRange(r => i += r[1] - r[0] + 1);
    return i;
  }

  /**
   * 添加一个范围
   *
   * 添加时只能按顺序添加，不能添加比上一次的最小数还小的值
   *
   * @example
   *
   * range.add(1, 3).add(5, 10).add(4, 12); // Error: 4 比 5 小，不能添加
   *
   * @param {Number} start - range 起始值
   * @param {Number} [end] - range 结束值
   * @returns {Range}
   */
  add(start, end) {
    if (!end) end = start;
    if (end < start) throw new SyntaxError('START_SHOULD_LESS_THEN_END');
    if (start < MIN_NUMBER || end > MAX_NUMBER) throw new RangeError('NUMBER_OUT_OF_RANGE');

    let ranges = this._ranges;
    let range = [start, end];

    if (ranges.length) {
      let last = ranges[ranges.length - 1];

      if (start < last[0]) throw new RangeError('START_OUT_OF_ORDER');

      if (last[1] + 1 < start) {
        ranges.push(range);
      } else if (last[1] < end) {
        last[1] = end;
      }
    } else {
      ranges.push(range);
    }

    return this;
  }

  /**
   * 遍历此范围内的每个数字
   *
   * @param {Function} fn
   *
   *    - @arg {Number} number
   *    - @arg {Array<Number>} subRange
   *    - @arg {Range} self
   *
   * @returns {Range}
   */
  eachNumber(fn) {
    this.eachSubRange(range => {
      for (let j = range[0]; j <= range[1]; j++) {
        if (fn(j, range, this) === false) return this;
      }
    });
    return this;
  }

  /**
   * 遍历每个子范围
   * @param {Function} fn
   *
   *    - @arg {Array<Number>} subRange
   *    - @arg {Number} i
   *    - @arg {Range} self
   *
   * @returns {Range}
   */
  eachSubRange(fn) {
    let i;
    for (i = 0; i < this._ranges.length; i++) {
      if (fn(this._ranges[i], i, this) === false) return this;
    }
    return this;
  }

  /**
   * 从当前 ranges 中抽取一段范围来形成新的 Range
   * @param {Number} start
   * @param {Number} end
   * @returns Range
   */
  extract(start, end) {
    let range = new Range(), i, r;
    if (end < start) return range;

    for (i = 0; i < this._ranges.length; i++) {
      r = this._ranges[i];

      if (start < r[0] && end >= r[0]) {
        range.add(r[0], end > r[1] ? r[1] : end);
      } else if (start >= r[0] && start <= r[1]) {
        range.add(start, end > r[1] ? r[1] : end);
      }

      if (end <= r[1]) break;
    }

    return range;
  }

  /**
   * Range 是否包含了 number
   * @param {Number} number
   * @returns {boolean}
   */
  contains(number) {
    return this._ranges.some(range => includes(range, number));
  }

  /**
   * @returns {String}
   */
  toString() {
    return JSON.stringify(this.toJSON());
  }

  toJSON() {
    let res = [];
    this.eachSubRange(r => res.push(r[1] === r[0] ? [r[0]] : r));
    return res;
  }
}

Range.MIN_NUMBER = MIN_NUMBER;
Range.MAX_NUMBER = MAX_NUMBER;
