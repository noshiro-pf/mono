// Each component of this library beside Blueprint React's for the same props,
// read by `blueprint-markup.test.tsx`, which compares their markup, and by
// `visual-parity.test.tsx`, which compares how they are drawn.
import * as Blueprint from '@blueprintjs/core';
import * as BlueprintDatetime from '@blueprintjs/datetime';
import {
  Button,
  ButtonGroup,
  Callout,
  Card,
  Checkbox,
  Collapse,
  DateInput,
  DatePicker,
  FileInput,
  formatDateText,
  HtmlSelect,
  HtmlTable,
  Icon,
  InputGroup,
  Label,
  Navbar,
  NavbarGroup,
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
import { constant, type JSX } from 'synstate-dom';

/**
 * Renders `element` with Blueprint React into `container` at once, and returns
 * what unmounts it.
 */
export const mountBlueprint = (
  element: () => ReactElement,
  container: HTMLElement,
): (() => void) => {
  const root = createRoot(container);

  const unmount = (): void => {
    root.unmount();
  };

  try {
    flushSync(() => {
      root.render(element());
    });
  } catch (error) {
    unmount();

    throw error;
  }

  return unmount;
};

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

/**
 * `Intl`'s short weekday names (`Sun`), which this library's pickers show, for
 * Blueprint's, which shows date-fns's shortest (`Su`) and which `Intl` has no
 * format for: the one text the two are known to differ in, given to Blueprint
 * so that the rest of the picker, the weekdays' order included, is compared.
 */
const intlWeekdayName = (date: Date): string => shortWeekday.format(date);

const shortWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

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

/**
 * Blueprint points a tab with no panel at a panel id that is never rendered,
 * and says whether it is expanded; this library says neither of a tab that
 * controls nothing. For a case whose tabs all have no panel.
 */
const noPanelControlled = (line: string): string =>
  line
    .replace(/\[aria-controls=#missing\]/u, '')
    .replace(/\[aria-expanded=(?:true|false)\]/u, '');

/** A date for Blueprint React's pickers, which take a `Date`. */
const blueprintDate = (isoLocal: string): Date => new Date(isoLocal);

export const cases: readonly Case[] = [
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
    'Button that toggles a region, with an icon',
    {
      element: () =>
        h(Blueprint.Button, {
          'aria-controls': 'region',
          'aria-expanded': true,
          'aria-label': 'Labels',
          icon: 'double-chevron-up',
        }),
      deliberate: [],
    },
    () => (
      <Button
        aria-controls={constant('region')}
        aria-expanded={constant('true')}
        aria-label={constant('Labels')}
        icon={'double-chevron-up'}
      />
    ),
  ],
  [
    'Collapse, open',
    {
      element: () =>
        h(
          Blueprint.Collapse,
          { isOpen: true, keepChildrenMounted: true },
          h('p', null, 'Body'),
        ),
      deliberate: [],
    },
    () => (
      <Collapse isOpen={constant(true)} keepChildrenMounted>
        <p>{constant('Body')}</p>
      </Collapse>
    ),
  ],
  [
    'Collapse, closed, its children kept',
    {
      element: () =>
        h(
          Blueprint.Collapse,
          { isOpen: false, keepChildrenMounted: true },
          h('p', null, 'Body'),
        ),
      deliberate: [],
    },
    () => (
      <Collapse isOpen={constant(false)} keepChildrenMounted>
        <p>{constant('Body')}</p>
      </Collapse>
    ),
  ],
  [
    'Collapse, closed',
    {
      element: () =>
        h(Blueprint.Collapse, { isOpen: false }, h('p', null, 'Body')),
      deliberate: [],
    },
    () => (
      <Collapse isOpen={constant(false)}>
        <p>{constant('Body')}</p>
      </Collapse>
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
    'NumericInput at its upper bound',
    {
      element: () =>
        h(Blueprint.NumericInput, {
          value: 10,
          min: 0,
          max: 10,
          onValueChange: ignore,
        }),
      deliberate: [disabledButtonTabIndex],
    },
    () => (
      <NumericInput
        decode={Number}
        encode={String}
        max={constant(10)}
        min={constant(0)}
        normalize={(n) => n}
        value={constant(10)}
        onValueChange={ignore}
      />
    ),
  ],
  [
    'NumericInput at its lower bound',
    {
      element: () =>
        h(Blueprint.NumericInput, {
          value: 0,
          min: 0,
          max: 10,
          onValueChange: ignore,
        }),
      deliberate: [disabledButtonTabIndex],
    },
    () => (
      <NumericInput
        decode={Number}
        encode={String}
        max={constant(10)}
        min={constant(0)}
        normalize={(n) => n}
        value={constant(0)}
        onValueChange={ignore}
      />
    ),
  ],
  [
    'NumericInput disabled',
    {
      element: () =>
        h(Blueprint.NumericInput, {
          value: 5,
          min: 0,
          max: 10,
          disabled: true,
          onValueChange: ignore,
        }),
      deliberate: [disabledButtonTabIndex],
    },
    () => (
      <NumericInput
        decode={Number}
        disabled={constant(true)}
        encode={String}
        max={constant(10)}
        min={constant(0)}
        normalize={(n) => n}
        value={constant(5)}
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
    'Icon, large',
    {
      element: () =>
        h(Blueprint.Icon, {
          icon: 'eye-open',
          size: Blueprint.IconSize.LARGE,
        }),
      deliberate: [],
    },
    () => <Icon icon={'eye-open'} size={20} />,
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
    'Tabs with no panels',
    {
      // Titles alone, as in a navbar: the panels are drawn elsewhere.
      element: () =>
        h(
          Blueprint.Tabs,
          {
            id: 'n',
            selectedTabId: 'a',
            animate: false,
            onChange: ignore,
          },
          h(Blueprint.Tab, { id: 'a', title: 'A' }),
          h(Blueprint.Tab, { id: 'b', title: 'B' }),
        ),
      deliberate: [noPanelControlled],
    },
    () => (
      <Tabs
        id={'n'}
        selectedTabId={constant('a')}
        tabs={[
          { id: 'a', title: 'A' },
          { id: 'b', title: 'B' },
        ]}
        onChange={ignore}
      />
    ),
  ],
  [
    'Navbar',
    {
      element: () =>
        h(
          Blueprint.Navbar,
          null,
          h(Blueprint.NavbarGroup, null, h('span')),
          h(Blueprint.NavbarGroup, { align: 'right' }, h('span')),
        ),
      deliberate: [],
    },
    () => (
      <Navbar>
        <NavbarGroup>
          <span />
        </NavbarGroup>
        <NavbarGroup align={'right'}>
          <span />
        </NavbarGroup>
      </Navbar>
    ),
  ],
  [
    'InputGroup with a left icon',
    {
      element: () =>
        h(Blueprint.InputGroup, {
          value: 'x',
          leftIcon: 'filter-list',
          placeholder: 'p',
          onChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <InputGroup
        leftIcon={'filter-list'}
        placeholder={constant('p')}
        value={constant('x')}
      />
    ),
  ],
  [
    'Button with only the sort icon',
    {
      element: () =>
        h(Blueprint.Button, {
          icon: 'sort',
          variant: 'minimal',
          'aria-label': 'Sort',
        }),
      deliberate: [],
    },
    () => (
      <Button
        aria-label={constant('Sort')}
        icon={'sort'}
        variant={constant('minimal')}
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
          dayPickerProps: {
            formatters: { formatWeekdayName: intlWeekdayName },
          },
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
          dayPickerProps: {
            formatters: { formatWeekdayName: intlWeekdayName },
          },
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
          // As this library's DateInput shows a date by default.
          formatDate: (date: Date) =>
            formatDateText(
              {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                hour: date.getHours(),
                minute: date.getMinutes(),
              },
              undefined,
            ),
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
