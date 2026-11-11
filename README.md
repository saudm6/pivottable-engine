# pivottable-engine

`pivottable-engine` computes pivot tables in JavaScript. It groups records into
rows and columns and runs an aggregator, such as Sum or Count, on each cell. It
has no dependencies and ships TypeScript types.

It is a fork of
[plotly/react-pivottable](https://github.com/plotly/react-pivottable), which
ports [PivotTable.js](https://github.com/nicolaskruchten/pivottable) by Nicolas
Kruchten to React. This fork keeps only the calculation engine. It has no React
and no UI.

## Install

```sh
npm install github:saudm6/pivottable-engine
```

## Usage

```ts
import {PivotData} from 'pivottable-engine';
import type {PivotRecord} from 'pivottable-engine';

const records: PivotRecord[] = [
  {region: 'North', product: 'Tea', sales: 10},
  {region: 'North', product: 'Coffee', sales: 5},
  {region: 'South', product: 'Tea', sales: 7},
];

const pivot = new PivotData({
  data: records,
  rows: ['region'],
  cols: ['product'],
  vals: ['sales'],
  aggregatorName: 'Sum',
});

for (const rowKey of pivot.getRowKeys()) {
  for (const colKey of pivot.getColKeys()) {
    const cell = pivot.getAggregator(rowKey, colKey);
    console.log(rowKey, colKey, cell.format(cell.value()));
  }
}
```

Row and column keys hold the raw record values, so a number field gives
number keys. The `derivedAttributes` option writes each derived value onto the
record objects you pass in. Pass copies if your records must not change.

## Built-in aggregators

- Count
- Count Unique Values
- List Unique Values
- Sum
- Integer Sum
- Average
- Median
- Sample Variance
- Sample Standard Deviation
- Minimum
- Maximum
- First
- Last
- Sum over Sum
- Sum as Fraction of Total
- Sum as Fraction of Rows
- Sum as Fraction of Columns
- Count as Fraction of Total
- Count as Fraction of Rows
- Count as Fraction of Columns

## License

MIT. The upstream copyright notice is kept in [LICENSE](LICENSE).
