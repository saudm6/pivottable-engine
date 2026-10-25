import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import * as utils from '../Utilities.js';

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fixtureData = [
  ['name', 'gender', 'colour', 'birthday', 'trials', 'successes'],
  ['Nick', 'male', 'blue', '1982-11-07', 103, 12],
  ['Jane', 'female', 'red', '1982-11-08', 95, 25],
  ['John', 'male', 'blue', '1982-12-08', 112, 30],
  ['Carol', 'female', 'yellow', '1983-12-08', 102, 14],
];

describe('  utils', function() {
  describe('.PivotData()', function() {
    describe('with no options', function() {
      const aoaInput = [['a', 'b'], [1, 2], [3, 4]];
      const pd = new utils.PivotData({data: aoaInput});

      it('has the correct grand total value', () =>
        assert.equal(pd.getAggregator([], []).value(), 2));
    });

    describe('with array-of-array input', function() {
      const aoaInput = [['a', 'b'], [1, 2], [3, 4]];
      const pd = new utils.PivotData({
        data: aoaInput,
        aggregatorName: 'Sum over Sum',
        vals: ['a', 'b'],
      });

      it('has the correct grand total value', () =>
        assert.equal(pd.getAggregator([], []).value(), (1 + 3) / (2 + 4)));
    });

    describe('with array-of-object input', function() {
      const aosInput = [{a: 1, b: 2}, {a: 3, b: 4}];
      const pd = new utils.PivotData({
        data: aosInput,
        aggregatorName: 'Sum over Sum',
        vals: ['a', 'b'],
      });

      it('has the correct grand total value', () =>
        assert.equal(pd.getAggregator([], []).value(), (1 + 3) / (2 + 4)));
    });

    describe('with ragged array-of-object input', function() {
      const raggedAosInput = [{a: 1}, {b: 4}, {a: 3, b: 2}];
      const pd = new utils.PivotData({
        data: raggedAosInput,
        aggregatorName: 'Sum over Sum',
        vals: ['a', 'b'],
      });

      it('has the correct grand total value', () =>
        assert.equal(pd.getAggregator([], []).value(), (1 + 3) / (2 + 4)));
    });

    describe('with function input', function() {
      const functionInput = function(record) {
        record({a: 1, b: 2});
        record({a: 3, b: 4});
      };
      const pd = new utils.PivotData({
        data: functionInput,
        aggregatorName: 'Sum over Sum',
        vals: ['a', 'b'],
      });

      it('has the correct grand total value', () =>
        assert.equal(pd.getAggregator([], []).value(), (1 + 3) / (2 + 4)));
    });

    describe('with rows/cols', function() {
      const pd = new utils.PivotData({
        data: fixtureData,
        rows: ['name', 'colour'],
        cols: ['trials', 'successes'],
      });

      it('has correctly-ordered row keys', () =>
        assert.deepStrictEqual(pd.getRowKeys(), [
          ['Carol', 'yellow'],
          ['Jane', 'red'],
          ['John', 'blue'],
          ['Nick', 'blue'],
        ]));

      it('has correctly-ordered col keys', () =>
        assert.deepStrictEqual(pd.getColKeys(), [
          [95, 25],
          [102, 14],
          [103, 12],
          [112, 30],
        ]));

      it('can be iterated over', function() {
        let numNotNull = 0;
        let numNull = 0;
        for (const r of Array.from(pd.getRowKeys())) {
          for (const c of Array.from(pd.getColKeys())) {
            if (pd.getAggregator(r, c).value() !== null) {
              numNotNull++;
            } else {
              numNull++;
            }
          }
        }
        assert.equal(numNotNull, 4);
        assert.equal(numNull, 12);
      });

      it('returns matching records', function() {
        const records = [];
        pd.forEachMatchingRecord({gender: 'male'}, x => records.push(x.name));
        assert.deepStrictEqual(records, ['Nick', 'John']);
      });

      it('has a correct spot-checked aggregator', function() {
        const agg = pd.getAggregator(['Carol', 'yellow'], [102, 14]);
        const val = agg.value();
        assert.equal(val, 1);
        assert.equal(agg.format(val), '1');
      });

      it('has a correct grand total aggregator', function() {
        const agg = pd.getAggregator([], []);
        const val = agg.value();
        assert.equal(val, 4);
        assert.equal(agg.format(val), '4');
      });
    });
  });

  describe('.aggregatorTemplates', function() {
    const getVal = (agg, vals) => {
      return new utils.PivotData({
        data: fixtureData,
        aggregators: {agg},
        aggregatorName: 'agg',
        vals,
      })
        .getAggregator([], [])
        .value();
    };
    const tpl = utils.aggregatorTemplates;

    describe('.count', () =>
      it('works', () => assert.equal(getVal(tpl.count(), []), 4)));

    describe('.countUnique', () =>
      it('works', () =>
        assert.equal(getVal(tpl.countUnique(), ['gender']), 2)));

    describe('.listUnique', () =>
      it('works', () =>
        assert.equal(getVal(tpl.listUnique(), ['gender']), 'male,female')));

    describe('.average', () =>
      it('works', () => assert.equal(getVal(tpl.average(), ['trials']), 103)));

    describe('.sum', () =>
      it('works', () => assert.equal(getVal(tpl.sum(), ['trials']), 412)));

    describe('.min', () =>
      it('works', () => assert.equal(getVal(tpl.min(), ['trials']), 95)));

    describe('.max', () =>
      it('works', () => assert.equal(getVal(tpl.max(), ['trials']), 112)));

    describe('.first', () =>
      it('works', () => assert.equal(getVal(tpl.first(), ['name']), 'Carol')));

    describe('.last', () =>
      it('works', () => assert.equal(getVal(tpl.last(), ['name']), 'Nick')));

    describe('.average', () =>
      it('works', () => assert.equal(getVal(tpl.average(), ['trials']), 103)));

    describe('.median', () =>
      it('works', () => assert.equal(getVal(tpl.median(), ['trials']), 102.5)));

    describe('.quantile', () =>
      it('works', function() {
        assert.equal(getVal(tpl.quantile(0), ['trials']), 95);
        assert.equal(getVal(tpl.quantile(0.1), ['trials']), 98.5);
        assert.equal(getVal(tpl.quantile(0.25), ['trials']), 98.5);
        assert.equal(getVal(tpl.quantile(1 / 3), ['trials']), 102);
        assert.equal(getVal(tpl.quantile(1), ['trials']), 112);
      }));

    describe('.var', () =>
      it('works', () =>
        assert.equal(getVal(tpl.var(), ['trials']), 48.666666666666686)));

    describe('.stdev', () =>
      it('works', () =>
        assert.equal(getVal(tpl.stdev(), ['trials']), 6.976149845485451)));

    describe('.sumOverSum', () =>
      it('works', () =>
        assert.equal(
          getVal(tpl.sumOverSum(), ['successes', 'trials']),
          (12 + 25 + 30 + 14) / (95 + 102 + 103 + 112)
        )));

    describe('.fractionOf', () =>
      it('works', () =>
        assert.equal(getVal(tpl.fractionOf(tpl.sum()), ['trials']), 1)));
  });

  describe('.naturalSort()', function() {
    const {naturalSort} = utils;

    const sortedArr = [
      null,
      NaN,
      -Infinity,
      '-Infinity',
      -3,
      '-3',
      -2,
      '-2',
      -1,
      '-1',
      0,
      '2e-1',
      1,
      '01',
      '1',
      2,
      '002',
      '002e0',
      '02',
      '2',
      '2e-0',
      3,
      10,
      '10',
      '11',
      '12',
      '1e2',
      '112',
      Infinity,
      'Infinity',
      '1a',
      '2a',
      '12a',
      '20a',
      'A',
      'A',
      'NaN',
      'a',
      'a',
      'a01',
      'a012',
      'a02',
      'a1',
      'a2',
      'a12',
      'a12',
      'a21',
      'a21',
      'b',
      'c',
      'd',
      'null',
    ];

    it('sorts naturally (null, NaN, numbers & numbery strings, Alphanum for text strings)', () =>
      assert.deepStrictEqual(sortedArr.slice().sort(naturalSort), sortedArr));
  });

  describe('.sortAs()', function() {
    const {sortAs} = utils;

    it('sorts with unknown values sorted at the end', () =>
      assert.deepStrictEqual([5, 2, 3, 4, 1].sort(sortAs([4, 3, 2])), [
        4,
        3,
        2,
        1,
        5,
      ]));

    it('sorts lowercase after uppercase', () =>
      assert.deepStrictEqual(
        ['Ab', 'aA', 'aa', 'ab'].sort(sortAs(['Ab', 'Aa'])),
        ['Ab', 'ab', 'aa', 'aA']
      ));
  });

  describe('.numberFormat()', function() {
    const {numberFormat} = utils;

    it('formats numbers', function() {
      const nf = numberFormat();
      assert.deepStrictEqual(nf(1234567.89123456), '1,234,567.89');
    });

    it('formats booleans', function() {
      const nf = numberFormat();
      assert.deepStrictEqual(nf(true), '1.00');
    });

    it('formats numbers in strings', function() {
      const nf = numberFormat();
      assert.deepStrictEqual(nf('1234567.89123456'), '1,234,567.89');
    });

    it("doesn't formats strings", function() {
      const nf = numberFormat();
      assert.deepStrictEqual(nf('hi there'), '');
    });

    it("doesn't formats objects", function() {
      const nf = numberFormat();
      assert.deepStrictEqual(nf({a: 1}), '');
    });

    it('formats percentages', function() {
      const nf = numberFormat({scaler: 100, suffix: '%'});
      assert.deepStrictEqual(nf(0.12345), '12.35%');
    });

    it('adds separators', function() {
      const nf = numberFormat({thousandsSep: 'a', decimalSep: 'b'});
      assert.deepStrictEqual(nf(1234567.89123456), '1a234a567b89');
    });

    it('adds prefixes and suffixes', function() {
      const nf = numberFormat({prefix: 'a', suffix: 'b'});
      assert.deepStrictEqual(nf(1234567.89123456), 'a1,234,567.89b');
    });

    it('scales and rounds', function() {
      const nf = numberFormat({digitsAfterDecimal: 3, scaler: 1000});
      assert.deepStrictEqual(nf(1234567.89123456), '1,234,567,891.235');
    });
  });

  describe('.derivers', function() {
    describe('.dateFormat()', function() {
      const df = utils.derivers.dateFormat(
        'x',
        'abc % %% %%% %a %y %m %n %d %w %x %H %M %S',
        true
      );

      it('formats date objects', () =>
        assert.equal(
          df({x: new Date('2015-01-02T23:43:11Z')}),
          'abc % %% %%% %a 2015 01 Jan 02 Fri 5 23 43 11'
        ));

      it('formats input parsed by Date.parse()', function() {
        assert.equal(
          df({x: '2015-01-02T23:43:11Z'}),
          'abc % %% %%% %a 2015 01 Jan 02 Fri 5 23 43 11'
        );

        assert.equal(df({x: 'bla'}), '');
      });
    });

    describe('.bin()', function() {
      const binner = utils.derivers.bin('x', 10);

      it('bins numbers', function() {
        assert.equal(binner({x: 11}), 10);

        assert.equal(binner({x: 9}), 0);

        assert.equal(binner({x: 111}), 110);
      });

      it('bins booleans', () => assert.equal(binner({x: true}), 0));

      it('bins negative numbers', () => assert.equal(binner({x: -12}), -10));

      it("doesn't bin strings", () =>
        assert.ok(Number.isNaN(binner({x: 'a'}))));

      it("doesn't bin objects", () =>
        assert.ok(Number.isNaN(binner({x: {a: 1}}))));
    });
  });
});
