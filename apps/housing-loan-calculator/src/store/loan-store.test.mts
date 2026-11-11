import {
  createMemoryBrowser,
  type MemoryBrowser,
  type Router,
} from 'synstate-router';
import { Optional } from 'ts-data-forge';
import { defaultValues, type Routes } from '../constants/index.mjs';
import { calcAll } from '../functions/index.mjs';
import {
  BorrowingTotal,
  maxBorrowingTotalManYen,
  minBorrowingTotalManYen,
  PercentFloat,
  Year,
} from '../types/index.mjs';
import { createLoanRouter } from './loan-router.mjs';
import { createLoanStore, type LoanStore } from './loan-store.mjs';

describe(createLoanStore, () => {
  test('starts from the defaults when the URL names nothing', () => {
    const { store } = setup('https://example.com/mono/loan/');

    assert.deepStrictEqual(
      Optional.unwrap(store.inputs.getSnapshot()),
      defaultValues,
    );
  });

  test('reads the inputs from the URL it was opened at', () => {
    const { store } = setup(
      'https://example.com/mono/loan/?repayment-type=principal-and-interest-equal-repayment&borrowing-total=3000&borrowing-period=20&interest-rate=1.2',
    );

    assert.deepStrictEqual(Optional.unwrap(store.inputs.getSnapshot()), {
      repaymentType: 'principal-and-interest-equal-repayment',
      borrowingTotalManYen: BorrowingTotal.cast(3000),
      borrowingPeriodYear: Year.cast(20),
      interestRatePercentPerYear: PercentFloat.cast(1.2),
    });
  });

  test('reads a parameter that is missing, or a repayment type that is not one, as its default', () => {
    const { store } = setup(
      'https://example.com/mono/loan/?repayment-type=monthly&interest-rate=2',
    );

    assert.deepStrictEqual(Optional.unwrap(store.inputs.getSnapshot()), {
      ...defaultValues,
      interestRatePercentPerYear: PercentFloat.cast(2),
    });
  });

  test.each([
    ['borrowing-total', 'abc'],
    ['borrowing-total', ''],
    ['borrowing-total', '12px'],
    ['borrowing-total', 'Infinity'],
    ['borrowing-total', '-1000'],
    ['borrowing-total', '1000001'],
    ['borrowing-total', '1e305'],
    ['borrowing-period', 'abc'],
    ['borrowing-period', '-1'],
    ['borrowing-period', '1.5'],
    ['borrowing-period', '0'],
    ['borrowing-period', '101'],
    ['borrowing-period', '100000000'],
    ['interest-rate', 'abc'],
    ['interest-rate', '-0.1'],
    ['interest-rate', '101'],
  ] as const)(
    'keeps the default for %s=%s, which is not a number in its range',
    (key, value) => {
      const { store } = setup(`https://example.com/mono/loan/?${key}=${value}`);

      assert.deepStrictEqual(
        Optional.unwrap(store.inputs.getSnapshot()),
        defaultValues,
      );
    },
  );

  test('accepts a rate of 100, a period of 1 and a total written with an exponent', () => {
    const { store } = setup(
      'https://example.com/mono/loan/?borrowing-total=1e3&borrowing-period=1&interest-rate=100',
    );

    assert.deepStrictEqual(Optional.unwrap(store.inputs.getSnapshot()), {
      ...defaultValues,
      borrowingTotalManYen: BorrowingTotal.cast(1000),
      borrowingPeriodYear: Year.cast(1),
      interestRatePercentPerYear: PercentFloat.cast(100),
    });
  });

  test.each([minBorrowingTotalManYen, maxBorrowingTotalManYen])(
    'accepts a total of %d, a bound of its range',
    (total) => {
      const { store } = setup(
        `https://example.com/mono/loan/?borrowing-total=${total}`,
      );

      assert.deepStrictEqual(Optional.unwrap(store.inputs.getSnapshot()), {
        ...defaultValues,
        borrowingTotalManYen: BorrowingTotal.cast(total),
      });
    },
  );

  test('accepts a period of 100, the longest there is', () => {
    const { store } = setup(
      'https://example.com/mono/loan/?borrowing-period=100',
    );

    assert.deepStrictEqual(Optional.unwrap(store.inputs.getSnapshot()), {
      ...defaultValues,
      borrowingPeriodYear: Year.cast(100),
    });
  });

  test('reads a URL that is not valid as the defaults, whatever was set before', () => {
    const { store, router } = setup('https://example.com/mono/loan/');

    store.setBorrowingTotalManYen(BorrowingTotal.cast(4000));

    store.setBorrowingPeriodYear(Year.cast(10));

    router.push(
      Optional.unwrapThrow(
        router.parseHref(
          '?borrowing-total=abc&borrowing-period=-1&interest-rate=101',
        ),
      ),
    );

    assert.deepStrictEqual(
      Optional.unwrap(store.inputs.getSnapshot()),
      defaultValues,
    );
  });

  test('going back to a URL that names nothing brings back the defaults', async () => {
    const { store, router } = setup('https://example.com/mono/loan/');

    store.setBorrowingTotalManYen(BorrowingTotal.cast(4000));

    router.back();

    await settle();

    assert.deepStrictEqual(
      Optional.unwrap(store.inputs.getSnapshot()),
      defaultValues,
    );
  });

  test('a URL off the page, such as its index.html, goes to the page with the inputs its query holds', () => {
    const { store, browser } = setup(
      'https://example.com/mono/loan/index.html?borrowing-total=3000&borrowing-period=abc#table',
    );

    assert.strictEqual(browser.url().pathname, '/mono/loan/');

    assert.strictEqual(browser.url().hash, '#table');

    assert.deepStrictEqual(Optional.unwrap(store.inputs.getSnapshot()), {
      ...defaultValues,
      borrowingTotalManYen: BorrowingTotal.cast(3000),
    });

    store.setBorrowingPeriodYear(Year.cast(10));

    assert.strictEqual(
      browser.url().searchParams.get('borrowing-period'),
      '10',
    );
  });

  test('a setter keeps the hash and the parameters the page does not declare', () => {
    const { store, browser } = setup(
      'https://example.com/mono/loan/?utm_source=x#table',
    );

    store.setBorrowingTotalManYen(BorrowingTotal.cast(4000));

    assert.strictEqual(browser.url().searchParams.get('utm_source'), 'x');

    assert.strictEqual(browser.url().hash, '#table');
  });

  test('a setter writes every input to the URL below the base path', () => {
    const { store, browser } = setup('https://example.com/mono/loan/');

    store.setBorrowingTotalManYen(BorrowingTotal.cast(4000));

    assert.strictEqual(browser.url().pathname, '/mono/loan/');

    assert.deepStrictEqual(Object.fromEntries(browser.url().searchParams), {
      'repayment-type': 'principal-equal-payment',
      'borrowing-total': '4000',
      'borrowing-period': '35',
      'interest-rate': '0.5',
    });

    assert.strictEqual(
      Optional.unwrap(store.inputs.getSnapshot()).borrowingTotalManYen,
      BorrowingTotal.cast(4000),
    );
  });

  test('each setter changes its own input only', () => {
    const { store } = setup('https://example.com/mono/loan/');

    store.setRepaymentType('principal-and-interest-equal-repayment');

    store.setBorrowingPeriodYear(Year.cast(10));

    store.setInterestRatePercentPerYear(PercentFloat.cast(0.8));

    assert.deepStrictEqual(Optional.unwrap(store.inputs.getSnapshot()), {
      repaymentType: 'principal-and-interest-equal-repayment',
      borrowingTotalManYen: defaultValues.borrowingTotalManYen,
      borrowingPeriodYear: Year.cast(10),
      interestRatePercentPerYear: PercentFloat.cast(0.8),
    });
  });

  test('going back in the history brings back the inputs before', async () => {
    const { store, router } = setup('https://example.com/mono/loan/');

    store.setBorrowingPeriodYear(Year.cast(10));

    store.setBorrowingPeriodYear(Year.cast(20));

    router.back();

    await settle();

    assert.strictEqual(
      Optional.unwrap(store.inputs.getSnapshot()).borrowingPeriodYear,
      Year.cast(10),
    );
  });

  test('calculates once the inputs stay still, and is calculating until then', async () => {
    const { store } = setup('https://example.com/mono/loan/');

    const mut_calculated: unknown[] = [];

    store.calculatedValues.subscribe((values) => {
      mut_calculated.push(values);
    });

    store.setBorrowingPeriodYear(Year.cast(10));

    assert.isTrue(Optional.unwrap(store.isCalculating.getSnapshot()));

    await settle();

    assert.isFalse(Optional.unwrap(store.isCalculating.getSnapshot()));

    assert.deepStrictEqual(
      mut_calculated.at(-1),
      calcAll(Optional.unwrap(store.inputs.getSnapshot())),
    );
  });
});

type Setup = Readonly<{
  store: LoanStore;
  browser: MemoryBrowser;
  router: Router<Routes>;
}>;

const setup = (href: string): Setup => {
  const browser = createMemoryBrowser(href);

  const router = createLoanRouter({ basePath: '/mono/loan/', browser });

  const store = createLoanStore({ router, calcDelayMs: 0 });

  return { store, browser, router } as const;
};

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
