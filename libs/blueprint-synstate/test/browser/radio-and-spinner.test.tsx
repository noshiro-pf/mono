import { RadioGroup, Spinner, SpinnerSize } from 'blueprint-synstate';
import { constant } from 'synstate-dom';
import { all, controlled, mountInto, one } from './helpers.mjs';

describe(RadioGroup, () => {
  const options = [
    { value: 'equal-principal', label: constant('Equal principal') },
    {
      value: 'equal-payment',
      label: constant('Equal payment'),
      'data-e2e': 'radio--equal-payment',
    },
  ] as const;

  test('draws a labelled radiogroup of Blueprint radios, the value checked', () => {
    const { value$, onChange } = controlled('equal-payment');

    const { container, unmount } = mountInto(() => (
      <RadioGroup
        label={constant('Repayment')}
        options={options}
        value={value$}
        onValueChange={onChange}
      />
    ));

    const group = one(container, 'div.bp6-radio-group');

    assert.strictEqual(group.getAttribute('role'), 'radiogroup');

    const label = one(group, ':scope > label.bp6-label');

    assert.strictEqual(label.textContent, 'Repayment');

    assert.strictEqual(group.getAttribute('aria-labelledby'), label.id);

    const radios = all<HTMLInputElement>(
      group,
      'label.bp6-control.bp6-radio > input.bp6-control-input[type="radio"]',
    );

    assert.deepStrictEqual(
      radios.map((r) => [r.value, r.checked, r.name === radios[0]?.name]),
      [
        ['equal-principal', false, true],
        ['equal-payment', true, true],
      ],
    );

    assert.strictEqual(radios[1]?.dataset['e2e'], 'radio--equal-payment');

    unmount();
  });

  test('a choice calls onValueChange with its value, and the value checks it', () => {
    const { value$, onChange, changes } = controlled('equal-payment');

    const { container, unmount } = mountInto(() => (
      <RadioGroup options={options} value={value$} onValueChange={onChange} />
    ));

    const [first, second] = all<HTMLInputElement>(container, 'input');

    assert.isDefined(first);

    assert.isDefined(second);

    first.click();

    assert.deepStrictEqual(changes, ['equal-principal']);

    assert.isTrue(first.checked);

    assert.isFalse(second.checked);

    unmount();
  });

  test('checks the value’s button again when the owner does not take a choice', () => {
    const { container, unmount } = mountInto(() => (
      <RadioGroup
        options={options}
        value={constant('equal-payment')}
        onValueChange={() => {}}
      />
    ));

    const [first, second] = all<HTMLInputElement>(container, 'input');

    assert.isDefined(first);

    assert.isDefined(second);

    first.click();

    assert.isFalse(first.checked);

    assert.isTrue(second.checked);

    unmount();
  });

  test('unchecks a choice the owner does not take when the value matches no option', () => {
    const { container, unmount } = mountInto(() => (
      <RadioGroup<string>
        options={options}
        value={constant('')}
        onValueChange={() => {}}
      />
    ));

    const [first] = all<HTMLInputElement>(container, 'input');

    assert.isDefined(first);

    first.click();

    assert.isFalse(first.checked);

    unmount();
  });

  test('two groups do not share a name', () => {
    const { container, unmount } = mountInto(() => (
      <>
        <RadioGroup
          options={options}
          value={constant('equal-payment')}
          onValueChange={() => {}}
        />
        <RadioGroup
          options={options}
          value={constant('equal-payment')}
          onValueChange={() => {}}
        />
      </>
    ));

    const names = new Set(
      all<HTMLInputElement>(container, 'input').map((r) => r.name),
    );

    assert.strictEqual(names.size, 2);

    unmount();
  });
});

describe(Spinner, () => {
  test('draws Blueprint’s spinner, with no value, at the size and intent given', () => {
    const { container, unmount } = mountInto(() => (
      <Spinner intent={'primary'} size={SpinnerSize.SMALL} />
    ));

    const spinner = one(container, '.bp6-spinner');

    assert.strictEqual(spinner.className, 'bp6-spinner bp6-intent-primary');

    assert.strictEqual(spinner.getAttribute('role'), 'progressbar');

    assert.strictEqual(spinner.getAttribute('aria-label'), 'loading');

    const svg = one(spinner, '.bp6-spinner-animation > svg');

    assert.strictEqual(svg.getAttribute('width'), '20');

    assert.strictEqual(
      one(svg, 'path.bp6-spinner-head').getAttribute('stroke-dashoffset'),
      '210',
    );

    unmount();
  });

  test('draws the standard size for a size that is not finite', () => {
    const { container, unmount } = mountInto(() => (
      <Spinner size={Number.NaN} />
    ));

    assert.strictEqual(one(container, 'svg').getAttribute('width'), '50');

    unmount();
  });
});
