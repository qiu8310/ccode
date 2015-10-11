'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var MIN_NUMBER = 0,
    MAX_NUMBER = 1114111;

function includes(range, number) {
  return range[0] <= number && number <= range[1];
}

var Range = (function () {

  /**
   * Range 构造函数
   * @param {Array<Array>} [ranges]
   */

  function Range(ranges) {
    var _this = this;

    _classCallCheck(this, Range);

    this._ranges = [];
    if (ranges && ranges.length) {
      ranges.forEach(function (r) {
        _this._ranges.push([r[0], r[1] || r[0]]);
      });
    }
  }

  _createClass(Range, [{
    key: 'add',

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
    value: function add(start, end) {
      if (!end) end = start;
      if (end < start) throw new SyntaxError('START_SHOULD_LESS_THEN_END');
      if (start < MIN_NUMBER || end > MAX_NUMBER) throw new RangeError('NUMBER_OUT_OF_RANGE');

      var ranges = this._ranges;
      var range = [start, end];

      if (ranges.length) {
        var last = ranges[ranges.length - 1];

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
  }, {
    key: 'eachNumber',

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
    value: function eachNumber(fn) {
      var _this2 = this;

      this.eachSubRange(function (range) {
        for (var j = range[0]; j <= range[1]; j++) {
          if (fn(j, range, _this2) === false) return _this2;
        }
      });
      return this;
    }
  }, {
    key: 'eachSubRange',

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
    value: function eachSubRange(fn) {
      var i = undefined;
      for (i = 0; i < this._ranges.length; i++) {
        if (fn(this._ranges[i], i, this) === false) return this;
      }
      return this;
    }
  }, {
    key: 'extract',

    /**
     * 从当前 ranges 中抽取一段范围来形成新的 Range
     * @param {Number} start
     * @param {Number} end
     * @returns Range
     */
    value: function extract(start, end) {
      var range = new Range(),
          i = undefined,
          r = undefined;
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
  }, {
    key: 'contains',

    /**
     * Range 是否包含了 number
     * @param {Number} number
     * @returns {boolean}
     */
    value: function contains(number) {
      return this._ranges.some(function (range) {
        return includes(range, number);
      });
    }
  }, {
    key: 'toString',

    /**
     * @returns {String}
     */
    value: function toString() {
      return JSON.stringify(this.toJSON());
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var res = [];
      this.eachSubRange(function (r) {
        return res.push(r[1] === r[0] ? [r[0]] : r);
      });
      return res;
    }
  }, {
    key: 'count',

    /**
     * 获取当前范围内的数字的总数
     * @returns {number}
     */
    get: function () {
      var i = 0;
      this.eachSubRange(function (r) {
        return i += r[1] - r[0] + 1;
      });
      return i;
    }
  }], [{
    key: 'fromNumbers',

    /**
     * @param {Array<Number>} numbers
     */
    value: function fromNumbers(numbers) {
      var r = new Range();
      numbers.sort(function (a, b) {
        return a - b;
      }).forEach(function (n) {
        return r.add(n);
      });
      return r;
    }
  }]);

  return Range;
})();

exports['default'] = Range;

Range.MIN_NUMBER = MIN_NUMBER;
Range.MAX_NUMBER = MAX_NUMBER;
module.exports = exports['default'];