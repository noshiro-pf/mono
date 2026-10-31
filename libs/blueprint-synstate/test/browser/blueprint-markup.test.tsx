import { Arr } from 'ts-data-forge';
// Compares each component's markup with Blueprint React's for the same props,
// since the library promises Blueprint's markup so that Blueprint's style
// sheets draw it, and a test written from what its author expected can drift
// from Blueprint unnoticed.
import * as Blueprint from '@blueprintjs/core';
import * as BlueprintDatetime from '@blueprintjs/datetime';
import {
  Button,
  ButtonGroup,
  Callout,
  Card,
  Checkbox,
  DateInput,
  DatePicker,
  FileInput,
  HtmlSelect,
  HtmlTable,
  Icon,
  InputGroup,
  Label,
  NumericInput,
  NumericInputView,
  Radio,
  RadioGroup,
  SegmentedControl,
  Spinner,
  SpinnerSize,
  Tabs,
  TimePicker,
} from 'blueprint-synstate';
import { createElement as h, type ReactElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { constant, render, type JSX } from 'synstate-dom';

describe('markup', () => {
  test.each(cases)('%s matches Blueprint React', (_name, theirs, ours) => {
    const blueprint = renderBlueprint(theirs.element);

    const synstate = renderSynstate(ours);

    assert.deepStrictEqual(
      synstate,
      theirs.deliberate.reduce<readonly string[]>(
        (lines, adjust) =>
          Arr.generate(function* () {
            for (const line of lines) {
              const adjusted = adjust(line);

              if (adjusted !== undefined) {
                yield adjusted;
              }
            }
          }),
        blueprint,
      ),
    );
  });
});

type Case = readonly [
  name: string,
  theirs: Readonly<{
    element: () => ReactElement;
    /**
     * Where this library differs from Blueprint on purpose: each line of
     * Blueprint's markup is read as what these make of it, and left out where
     * one returns `undefined`. Each says why.
     */
    deliberate: readonly ((line: string) => string | undefined)[];
  }>,
  ours: () => JSX.Element,
];

const indent = (depth: number): string => '  '.repeat(depth);

/** The icon name of `span.bp6-icon.bp6-icon-<name>`, if `element` is one. */
const iconNameOf = (element: Element): string | undefined =>
  element.classList.contains('bp6-icon')
    ? Array.from(element.classList)
        .find(
          (c) =>
            c.startsWith('bp6-icon-') &&
            c !== 'bp6-icon-standard' &&
            c !== 'bp6-icon-large',
        )
        ?.slice('bp6-icon-'.length)
    : undefined;

/**
 * A line per element, indented by depth: the tag, the sorted classes, and the
 * attributes Blueprint's style sheets or assistive technology read.
 * Text, ids and React's own attributes are left out. An attribute that names an
 * id says only whether the element it names is in the tree.
 */
const linesOf = (container: Element): readonly string[] => {
  const lines = (element: Element, depth: number): readonly string[] => {
    const tag = element.tagName.toLowerCase();

    const icon = iconNameOf(element);

    if (icon !== undefined) {
      // Blueprint draws an icon's SVG once its paths have loaded, gives it
      // `bp6-icon-standard` meanwhile, and may leave it to assistive
      // technology. Icons here are drawn at once and always hidden, since each
      // sits on a control whose own label says what it does.
      return [`${indent(depth)}span.bp6-icon.bp6-icon-${icon}`];
    }

    const classes = Array.from(element.classList)
      .toSorted()
      .map((c) => `.${c}`)
      .join('');

    const attributes = Array.from(element.attributes)
      .filter(
        ({ name }) => readAttributes.has(name) || name.startsWith('aria-'),
      )
      .map(({ name, value }) =>
        idReferences.has(name)
          ? `[${name}=${value.split(/\s+/u).every((id) => container.querySelector(`#${CSS.escape(id)}`) !== null) ? '#found' : '#missing'}]`
          : `[${name}=${value}]`,
      )
      .toSorted()
      .join('');

    const line = `${indent(depth)}${tag}${classes}${attributes}` as const;

    return tag === 'svg'
      ? [line]
      : Arr.toUnshifted(line)(
          Array.from(element.children).flatMap((child) =>
            lines(child, depth + 1),
          ),
        );
  };

  return Array.from(container.children).flatMap((child) => lines(child, 0));
};

const readAttributes: ReadonlySet<string> = new Set<string>([
  'disabled',
  'role',
  'tabindex',
  'type',
]);

const idReferences: ReadonlySet<string> = new Set<string>([
  'aria-activedescendant',
  'aria-controls',
  'aria-describedby',
  'aria-labelledby',
  'aria-owns',
]);

/**
 * A container in the document, removed when the test finishes, failed or not,
 * so that a failing case leaves nothing behind for the cases after it.
 */
const attached = (): HTMLDivElement => {
  const container = document.createElement('div');

  document.body.append(container);

  onTestFinished(() => {
    container.remove();
  });

  return container;
};

const renderBlueprint = (element: () => ReactElement): readonly string[] => {
  const container = attached();

  const root = createRoot(container);

  onTestFinished(() => {
    root.unmount();
  });

  flushSync(() => {
    root.render(element());
  });

  return linesOf(container);
};

const renderSynstate = (app: () => JSX.Element): readonly string[] => {
  const container = attached();

  onTestFinished(render(app, container));

  return linesOf(container);
};

const ignore = (): void => {};

/** The `<span>` this library puts its select in, so that a label may hold it. */
const htmlSelectWrapper = (line: string): string =>
  line.replace(
    /^\s*div(?=[\w.-]*\.bp6-html-select\b)/u,
    (match) => `${match.slice(0, -'div'.length)}span`,
  );

/** A disabled `<button>` is out of the tab order without `tabindex`. */
const disabledButtonTabIndex = (line: string): string =>
  /^\s*button\.[\w.-]*\.bp6-disabled\b/u.test(line)
    ? line.replace('[tabindex=-1]', '')
    : line;

/** A date for Blueprint React's pickers, which take a `Date`. */
const blueprintDate = (isoLocal: string): Date =>
  // eslint-disable-next-line unicorn/prefer-temporal -- Blueprint React's pickers take a Date
  new Date(isoLocal);

const cases: readonly Case[] = [
  [
    'Button',
    {
      element: () =>
        h(Blueprint.Button, {
          text: 'Go',
          intent: 'primary',
          icon: 'cog',
          endIcon: 'chevron-down',
        }),
      deliberate: [],
    },
    () => (
      <Button
        endIcon={'chevron-down'}
        icon={'cog'}
        intent={'primary'}
        text={constant('Go')}
      />
    ),
  ],
  [
    'Button, minimal, small and filling',
    {
      element: () =>
        h(Blueprint.Button, {
          text: 'Go',
          variant: 'minimal',
          size: 'small',
          fill: true,
          disabled: true,
        }),
      deliberate: [disabledButtonTabIndex],
    },
    () => (
      <Button
        disabled={constant(true)}
        fill
        size={'small'}
        text={constant('Go')}
        variant={constant('minimal')}
      />
    ),
  ],
  [
    'ButtonGroup',
    {
      element: () =>
        h(Blueprint.ButtonGroup, {
          variant: 'minimal',
          fill: true,
          children: [
            h(Blueprint.Button, { key: 'a', text: 'A' }),
            h(Blueprint.Button, { key: 'b', text: 'B' }),
          ],
        }),
      deliberate: [],
    },
    () => (
      <ButtonGroup fill minimal>
        <Button text={constant('A')} />
        <Button text={constant('B')} />
      </ButtonGroup>
    ),
  ],
  [
    'Callout',
    {
      element: () =>
        h(Blueprint.Callout, { intent: 'primary', title: 'T' }, 'x'),
      deliberate: [],
    },
    () => (
      <Callout intent={'primary'} title={constant('T')}>
        {constant('x')}
      </Callout>
    ),
  ],
  [
    'Callout, compact, with no title',
    {
      element: () =>
        h(Blueprint.Callout, { intent: 'danger', compact: true }, 'x'),
      deliberate: [],
    },
    () => (
      <Callout compact intent={'danger'}>
        {constant('x')}
      </Callout>
    ),
  ],
  [
    'Card',
    {
      element: () => h(Blueprint.Card, { elevation: 2, compact: true }, 'x'),
      deliberate: [],
    },
    () => (
      <Card compact elevation={2}>
        {constant('x')}
      </Card>
    ),
  ],
  [
    'Checkbox',
    {
      element: () =>
        h(Blueprint.Checkbox, {
          checked: true,
          label: 'L',
          inline: true,
          disabled: true,
          onChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <Checkbox
        checked={constant(true)}
        disabled={constant(true)}
        inline
        label={constant('L')}
        onChange={ignore}
      />
    ),
  ],
  [
    'Radio',
    {
      element: () =>
        h(Blueprint.Radio, {
          checked: true,
          label: 'L',
          value: 'a',
          onChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <Radio
        checked={constant(true)}
        label={constant('L')}
        value={'a'}
        onChange={ignore}
      />
    ),
  ],
  [
    'RadioGroup',
    {
      element: () =>
        h(Blueprint.RadioGroup, {
          label: 'G',
          inline: true,
          options: [{ value: 'a' }, { value: 'b', disabled: true }],
          selectedValue: 'a',
          onChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <RadioGroup
        inline
        label={constant('G')}
        options={[{ value: 'a' }, { value: 'b', disabled: true }]}
        value={constant('a')}
        onValueChange={ignore}
      />
    ),
  ],
  [
    'Spinner',
    { element: () => h(Blueprint.Spinner), deliberate: [] },
    () => <Spinner />,
  ],
  [
    'Spinner, small, with an intent',
    {
      element: () =>
        h(Blueprint.Spinner, {
          size: Blueprint.SpinnerSize.SMALL,
          intent: 'primary',
        }),
      deliberate: [],
    },
    () => <Spinner intent={'primary'} size={SpinnerSize.SMALL} />,
  ],
  [
    'NumericInputView',
    {
      element: () =>
        h(Blueprint.NumericInput, {
          value: 3,
          min: 0,
          max: 10,
          onValueChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <NumericInputView
        aria-valuenow={constant(3)}
        max={constant(10)}
        min={constant(0)}
        value={constant('3')}
        onValueChange={ignore}
      />
    ),
  ],
  [
    'NumericInput',
    {
      element: () =>
        h(Blueprint.NumericInput, {
          value: 3,
          intent: 'primary',
          fill: true,
          onValueChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <NumericInput
        decode={Number}
        encode={String}
        fill
        intent={'primary'}
        normalize={(n) => n}
        value={constant(3)}
        onValueChange={ignore}
      />
    ),
  ],
  [
    'InputGroup inside a Label',
    {
      element: () =>
        h(
          Blueprint.Label,
          null,
          'L',
          h(Blueprint.InputGroup, {
            value: 'x',
            intent: 'danger',
            onChange: ignore,
          }),
        ),
      deliberate: [],
    },
    () => (
      <Label text={constant('L')}>
        <InputGroup intent={'danger'} value={constant('x')} />
      </Label>
    ),
  ],
  [
    'HtmlSelect',
    {
      element: () =>
        h(
          Blueprint.HTMLSelect,
          { value: 'a', minimal: true, fill: true, onChange: ignore },
          h('option', { value: 'a' }, 'a'),
        ),
      deliberate: [htmlSelectWrapper],
    },
    () => (
      <HtmlSelect fill minimal value={constant('a')} onChange={ignore}>
        <option value={constant('a')}>{constant('a')}</option>
      </HtmlSelect>
    ),
  ],
  [
    'HtmlTable',
    {
      element: () =>
        h(
          Blueprint.HTMLTable,
          { striped: true, bordered: true, compact: true, interactive: true },
          h('tbody'),
        ),
      deliberate: [],
    },
    () => (
      <HtmlTable bordered compact interactive striped>
        <tbody />
      </HtmlTable>
    ),
  ],
  [
    'FileInput',
    {
      element: () =>
        h(Blueprint.FileInput, {
          onInputChange: ignore,
          text: 'Choose',
          fill: true,
        }),
      deliberate: [],
    },
    () => <FileInput fill text={constant('Choose')} onInputChange={ignore} />,
  ],
  [
    'Icon',
    { element: () => h(Blueprint.Icon, { icon: 'cog' }), deliberate: [] },
    () => <Icon icon={'cog'} />,
  ],
  [
    'SegmentedControl',
    {
      element: () =>
        h(Blueprint.SegmentedControl, {
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          value: 'a',
          onValueChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <SegmentedControl
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        value={constant('a')}
        onValueChange={ignore}
      />
    ),
  ],
  [
    'Tabs',
    {
      // Without the animated indicator, and with the chosen panel alone in the
      // document, as this library draws them: the underline is drawn from
      // `aria-selected`.
      element: () =>
        h(
          Blueprint.Tabs,
          {
            id: 't',
            selectedTabId: 'a',
            animate: false,
            renderActiveTabPanelOnly: true,
            onChange: ignore,
          },
          h(Blueprint.Tab, { id: 'a', title: 'A', panel: h('div') }),
          h(Blueprint.Tab, { id: 'b', title: 'B', panel: h('div') }),
        ),
      deliberate: [],
    },
    () => (
      <Tabs
        id={'t'}
        selectedTabId={constant('a')}
        tabs={[
          { id: 'a', title: 'A', panel: <div /> },
          { id: 'b', title: 'B', panel: <div /> },
        ]}
        onChange={ignore}
      />
    ),
  ],
  [
    'TimePicker',
    {
      element: () =>
        h(BlueprintDatetime.TimePicker, {
          value: blueprintDate('2026-01-01T10:20'),
          onChange: ignore,
        }),
      deliberate: [],
    },
    () => <TimePicker value={constant('10:20')} onChange={ignore} />,
  ],
  [
    'TimePicker with arrow buttons',
    {
      element: () =>
        h(BlueprintDatetime.TimePicker, {
          showArrowButtons: true,
          value: blueprintDate('2026-01-01T10:20'),
          onChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <TimePicker
        showArrowButtons
        value={constant('10:20')}
        onChange={ignore}
      />
    ),
  ],
  [
    'DatePicker',
    {
      element: () =>
        h(BlueprintDatetime.DatePicker, {
          value: blueprintDate('2026-10-15T00:00'),
          onChange: ignore,
        }),
      deliberate: [htmlSelectWrapper],
    },
    () => <DatePicker value={constant('2026-10-15')} onChange={ignore} />,
  ],
  [
    'DatePicker with a time and the actions bar',
    {
      element: () =>
        h(BlueprintDatetime.DatePicker, {
          value: blueprintDate('2026-10-15T10:20'),
          timePrecision: 'minute',
          showActionsBar: true,
          onChange: ignore,
        }),
      deliberate: [htmlSelectWrapper],
    },
    () => (
      <DatePicker
        showActionsBar
        timePrecision={'minute'}
        value={constant('2026-10-15T10:20')}
        onChange={ignore}
      />
    ),
  ],
  [
    'DateInput, closed',
    {
      element: () =>
        h(BlueprintDatetime.DateInput, {
          value: '2026-10-15',
          formatDate: (date: Date) => date.toDateString(),
          parseDate: blueprintDate,
          onChange: ignore,
        }),
      deliberate: [
        // Blueprint's popover marks its target as not disabled, which the
        // input's own `disabled` already says.
        (line) => line.replace('[aria-disabled=false]', ''),
        // Blueprint always gives the input a right element, for a timezone
        // select this library does not have, so its slot is there empty.
        (line) =>
          /^\s*span\.bp6-input-action$/u.test(line) ? undefined : line,
      ],
    },
    () => <DateInput value={constant('2026-10-15')} onChange={ignore} />,
  ],
] as const;
