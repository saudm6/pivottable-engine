type PivotRecord = Record<string, unknown>;

type PivotDataInput =
  | object[]
  | unknown[][]
  | ((addRecord: (record: object) => void) => void);

type Formatter = (x: unknown) => unknown;

type Sorter = (a: unknown, b: unknown) => number;

type Sorters = Record<string, Sorter> | ((attr: string) => Sorter | undefined);

type DerivedAttributes = Record<string, (record: PivotRecord) => unknown>;

type KeyOrder = 'key_a_to_z' | 'value_a_to_z' | 'value_z_to_a';

interface Aggregator {
  push(record: PivotRecord): void;
  value(): unknown;
  format(x: unknown): unknown;
  numInputs?: number;
}

type AggregatorGenerator = (
  vals: string[]
) => (data?: PivotData, rowKey?: unknown[], colKey?: unknown[]) => Aggregator;

type AggregatorName =
  | 'Count'
  | 'Count Unique Values'
  | 'List Unique Values'
  | 'Sum'
  | 'Integer Sum'
  | 'Average'
  | 'Median'
  | 'Sample Variance'
  | 'Sample Standard Deviation'
  | 'Minimum'
  | 'Maximum'
  | 'First'
  | 'Last'
  | 'Sum over Sum'
  | 'Sum as Fraction of Total'
  | 'Sum as Fraction of Rows'
  | 'Sum as Fraction of Columns'
  | 'Count as Fraction of Total'
  | 'Count as Fraction of Rows'
  | 'Count as Fraction of Columns';

interface PivotDataOptions {
  data: PivotDataInput;
  aggregators?: Record<string, AggregatorGenerator>;
  cols?: string[];
  rows?: string[];
  vals?: string[];
  aggregatorName?: string;
  sorters?: Sorters;
  valueFilter?: Record<string, Record<string, boolean>>;
  rowOrder?: KeyOrder;
  colOrder?: KeyOrder;
  derivedAttributes?: DerivedAttributes;
}

declare const aggregatorTemplates: {
  count(formatter?: Formatter): AggregatorGenerator;
  uniques(
    fn: (uniq: unknown[]) => unknown,
    formatter?: Formatter
  ): AggregatorGenerator;
  sum(formatter?: Formatter): AggregatorGenerator;
  extremes(
    mode: 'min' | 'max' | 'first' | 'last',
    formatter?: Formatter
  ): AggregatorGenerator;
  quantile(q: number, formatter?: Formatter): AggregatorGenerator;
  runningStat(
    mode?: 'mean' | 'var' | 'stdev',
    ddof?: number,
    formatter?: Formatter
  ): AggregatorGenerator;
  sumOverSum(formatter?: Formatter): AggregatorGenerator;
  fractionOf(
    wrapped: AggregatorGenerator,
    type?: 'total' | 'row' | 'col',
    formatter?: Formatter
  ): AggregatorGenerator;
  countUnique(formatter?: Formatter): AggregatorGenerator;
  listUnique(separator?: string): AggregatorGenerator;
  max(formatter?: Formatter): AggregatorGenerator;
  min(formatter?: Formatter): AggregatorGenerator;
  first(formatter?: Formatter): AggregatorGenerator;
  last(formatter?: Formatter): AggregatorGenerator;
  median(formatter?: Formatter): AggregatorGenerator;
  average(formatter?: Formatter): AggregatorGenerator;
  var(ddof?: number, formatter?: Formatter): AggregatorGenerator;
  stdev(ddof?: number, formatter?: Formatter): AggregatorGenerator;
};

declare const aggregators: Record<AggregatorName, AggregatorGenerator>;

declare const derivers: {
  bin(col: string, binWidth: number): (record: PivotRecord) => number;
  dateFormat(
    col: string,
    formatString: string,
    utcOutput?: boolean,
    mthNames?: string[],
    dayNames?: string[]
  ): (record: PivotRecord) => string;
};

declare const locales: {
  en: {
    aggregators: typeof aggregators;
    localeStrings: {
      renderError: string;
      computeError: string;
      uiRenderError: string;
      selectAll: string;
      selectNone: string;
      tooMany: string;
      filterResults: string;
      apply: string;
      cancel: string;
      totals: string;
      vs: string;
      by: string;
    };
  };
};

declare function naturalSort(as: unknown, bs: unknown): number;

declare function numberFormat(opts?: {
  digitsAfterDecimal?: number;
  scaler?: number;
  thousandsSep?: string;
  decimalSep?: string;
  prefix?: string;
  suffix?: string;
}): (x: unknown) => string;

declare function getSort(
  sorters: Sorters | null | undefined,
  attr: string
): Sorter;

declare function sortAs(order: unknown[]): Sorter;

declare class PivotData {
  constructor(inputProps: PivotDataOptions);
  props: Required<PivotDataOptions>;
  forEachMatchingRecord(
    criteria: Record<string, unknown>,
    callback: (record: PivotRecord) => void
  ): void;
  getColKeys(): unknown[][];
  getRowKeys(): unknown[][];
  getAggregator(
    rowKey: unknown[],
    colKey: unknown[]
  ): Aggregator | Pick<Aggregator, 'value' | 'format'>;
  static forEachRecord(
    input: PivotDataInput,
    derivedAttributes: DerivedAttributes,
    f: (record: PivotRecord) => void
  ): void;
  static defaultProps: Required<Omit<PivotDataOptions, 'data'>>;
}

export {
  aggregatorTemplates,
  aggregators,
  derivers,
  locales,
  naturalSort,
  numberFormat,
  getSort,
  sortAs,
  PivotData,
};

export type {
  Aggregator,
  AggregatorGenerator,
  PivotDataInput,
  PivotDataOptions,
  PivotRecord,
};
