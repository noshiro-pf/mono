import {
  Callout,
  Card,
  Checkbox,
  FileInput,
  HtmlTable,
  InputGroup,
  Label,
} from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant } from 'synstate-dom';
import { mountInto, one } from './helpers.mjs';

describe(Callout, () => {
  test('draws the intent’s icon and the title, or the icon it is given', () => {
    const { container, unmount } = mountInto(() => (
      <>
        <Callout intent={'danger'} title={constant('Failed')}>
          {constant('body')}
        </Callout>
        <Callout icon={false} intent={'warning'} />
      </>
    ));

    const [danger, warning] = Array.from(
      container.querySelectorAll('.bp6-callout'),
    );

    assert.deepStrictEqual(
      Array.from(danger?.classList ?? []).toSorted(),
      [
        'bp6-callout',
        'bp6-callout-has-body-content',
        'bp6-callout-icon',
        'bp6-intent-danger',
      ].toSorted(),
    );

    assert.isNotNull(danger?.querySelector(':scope > .bp6-icon-error'));

    assert.strictEqual(
      danger?.querySelector('h5.bp6-heading')?.textContent,
      'Failed',
    );

    assert.strictEqual(warning?.className, 'bp6-callout bp6-intent-warning');

    unmount();
  });
});

describe(Card, () => {
  test('carries the elevation', () => {
    const { container, unmount } = mountInto(() => (
      <Card elevation={2}>{constant('x')}</Card>
    ));

    assert.strictEqual(
      one(container, '.bp6-card').className,
      'bp6-card bp6-elevation-2',
    );

    unmount();
  });
});

describe(Checkbox, () => {
  test('draws the indicator and passes `change` on', () => {
    const [checked$, setChecked] = createState(false);

    const { container, unmount } = mountInto(() => (
      <Checkbox
        checked={checked$}
        label={constant('Agree')}
        onChange={(e) => {
          setChecked(e.currentTarget.checked);
        }}
      />
    ));

    const label = one(container, 'label.bp6-control.bp6-checkbox');

    assert.isNotNull(
      label.querySelector(':scope > input + .bp6-control-indicator'),
    );

    assert.strictEqual(label.textContent, 'Agree');

    one<HTMLInputElement>(label, ':scope > input').click();

    assert.isTrue(checked$.getSnapshot().value);

    unmount();
  });
});

describe(InputGroup, () => {
  test('is `input.bp6-input` in the wrapper, inside a label', () => {
    const { container, unmount } = mountInto(() => (
      <Label text={constant('Amount')}>
        <InputGroup step={'any'} type={'number'} value={constant('12')} />
      </Label>
    ));

    const input = one<HTMLInputElement>(
      container,
      'label.bp6-label > .bp6-input-group > input.bp6-input',
    );

    assert.strictEqual(input.value, '12');

    assert.strictEqual(input.type, 'number');

    assert.strictEqual(input.step, 'any');

    unmount();
  });
});

describe(FileInput, () => {
  test('puts the button text where Blueprint’s style sheet reads it', () => {
    const { container, unmount } = mountInto(() => (
      <FileInput
        accept={'.json'}
        buttonText={'Browse'}
        text={constant('Choose a file')}
        onInputChange={() => {}}
      />
    ));

    const span = one(
      container,
      'label.bp6-file-input > .bp6-file-upload-input',
    );

    assert.strictEqual(span.getAttribute('bp6-button-text'), 'Browse');

    assert.isTrue(span.classList.contains('bp6-file-upload-input-custom-text'));

    assert.strictEqual(
      one<HTMLInputElement>(container, 'input[type="file"]').accept,
      '.json',
    );

    unmount();
  });
});

describe(HtmlTable, () => {
  test('carries the modifier classes', () => {
    const { container, unmount } = mountInto(() => (
      <HtmlTable bordered compact>
        <tbody />
      </HtmlTable>
    ));

    assert.strictEqual(
      one(container, 'table').className,
      'bp6-html-table bp6-html-table-bordered bp6-compact',
    );

    unmount();
  });
});
