// Each component of this library beside Blueprint React's for the same props,
// read by `blueprint-markup.test.tsx`, which compares their markup, and by
// `visual-parity.test.tsx`, which compares how they are drawn.
import * as Blueprint from '@blueprintjs/core';
import * as BlueprintDatetime from '@blueprintjs/datetime';
import {
  AnchorButton,
  Button,
  ButtonGroup,
  Callout,
  Card,
  Checkbox,
  Collapse,
  ControlGroup,
  DateInput,
  DatePicker,
  FileInput,
  formatDateText,
  FormGroup,
  HtmlSelect,
  HtmlTable,
  Icon,
  InputGroup,
  Label,
  Navbar,
  NavbarGroup,
  NonIdealState,
  NumericInput,
  NumericInputView,
  Radio,
  RadioGroup,
  SegmentedControl,
  Spinner,
  SpinnerSize,
  Switch,
  Tabs,
  TextArea,
  TimePicker,
  type IconName,
  type IconName20,
} from 'blueprint-synstate';
import { createElement as h, type ReactElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { constant, type JSX } from 'synstate-dom';
import { expectType } from 'ts-data-forge';

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

/** A disabled `<button>` is out of the tab order without `tabindex`. */
export const disabledButtonTabIndex = (line: string): string =>
  /^\s*button\.[\w.-]*\.bp6-disabled\b/u.test(line)
    ? line.replace('[tabindex=-1]', '')
    : line;

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

/** Every icon this library draws, so that each path is compared with Blueprint's. */
const allIcons = [
  'add',
  'archive',
  'automatic-updates',
  'camera',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'chevron-up',
  'clipboard',
  'cog',
  'comment',
  'confirm',
  'cross',
  'desktop',
  'disable',
  'double-caret-vertical',
  'double-chevron-down',
  'double-chevron-up',
  'duplicate',
  'edit',
  'error',
  'export',
  'eye-off',
  'eye-open',
  'filter-list',
  'flash',
  'greater-than-or-equal-to',
  'help',
  'home',
  'import',
  'info-sign',
  'key',
  'less-than-or-equal-to',
  'lock',
  'log-out',
  'moon',
  'plus',
  'refresh',
  'reset',
  'saved',
  'search',
  'send-message',
  'small-cross',
  'sort',
  'sort-asc',
  'sort-desc',
  'star',
  'tick',
  'timeline-events',
  'trash',
  'unarchive',
  'unlock',
  'user',
  'warning-sign',
] as const satisfies readonly IconName[];

// A name added to the library and not here fails this.
expectType<(typeof allIcons)[number], IconName>('=');

/** Every icon this library also draws from the 20px paths. */
const allLargeIcons = [
  'archive',
  'confirm',
  'disable',
  'error',
  'eye-off',
  'eye-open',
  'lock',
  'reset',
  'search',
  'trash',
  'unarchive',
  'warning-sign',
] as const satisfies readonly IconName20[];

expectType<(typeof allLargeIcons)[number], IconName20>('=');

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
  [
    'Every icon',
    {
      element: () =>
        h(
          'div',
          null,
          allIcons.map((icon) => h(Blueprint.Icon, { key: icon, icon })),
        ),
      deliberate: [],
    },
    () => (
      <div>
        {allIcons.map((icon) => (
          <Icon icon={icon} />
        ))}
      </div>
    ),
  ],
  [
    'Every large icon',
    {
      element: () =>
        h(
          'div',
          null,
          allLargeIcons.map((icon) =>
            h(Blueprint.Icon, { key: icon, icon, size: 20 }),
          ),
        ),
      deliberate: [],
    },
    () => (
      <div>
        {allLargeIcons.map((icon) => (
          <Icon icon={icon} size={20} />
        ))}
      </div>
    ),
  ],
  [
    'Button, loading',
    {
      element: () =>
        h(Blueprint.Button, { text: 'Go', icon: 'cog', loading: true }),
      deliberate: [disabledButtonTabIndex],
    },
    () => (
      <Button icon={'cog'} loading={constant(true)} text={constant('Go')} />
    ),
  ],
  [
    'AnchorButton',
    {
      element: () =>
        h(Blueprint.AnchorButton, {
          href: '/x',
          icon: 'add',
          intent: 'primary',
          rel: 'noopener noreferrer',
          target: '_blank',
          text: 'New',
        }),
      deliberate: [],
    },
    () => (
      <AnchorButton
        href={constant('/x')}
        icon={'add'}
        intent={'primary'}
        rel={'noopener noreferrer'}
        target={'_blank'}
        text={constant('New')}
      />
    ),
  ],
  [
    'AnchorButton, minimal, with only an icon',
    {
      element: () =>
        h(Blueprint.AnchorButton, {
          href: '/help',
          icon: 'help',
          title: 'Help',
          variant: 'minimal',
        }),
      deliberate: [],
    },
    () => (
      <AnchorButton
        href={constant('/help')}
        icon={'help'}
        title={constant('Help')}
        variant={constant('minimal')}
      />
    ),
  ],
  [
    'AnchorButton, loading',
    {
      element: () =>
        h(Blueprint.AnchorButton, { href: '/x', loading: true, text: 'Open' }),
      deliberate: [
        // Blueprint passes `disabled` on to the `<a>`, which has no such
        // attribute; `aria-disabled` and `bp6-disabled` say it.
        (line) =>
          /^\s*a\./u.test(line) ? line.replace('[disabled=]', '') : line,
      ],
    },
    () => (
      <AnchorButton
        href={constant('/x')}
        loading={constant(true)}
        text={constant('Open')}
      />
    ),
  ],
  [
    'FormGroup',
    {
      element: () =>
        h(
          Blueprint.FormGroup,
          {
            label: 'Name',
            labelFor: 'form-group-name',
            labelInfo: '(required)',
            helperText: 'Enter a name.',
            intent: 'danger',
          },
          h(Blueprint.InputGroup, {
            id: 'form-group-name',
            intent: 'danger',
            value: '',
            onChange: ignore,
          }),
        ),
      deliberate: [],
    },
    () => (
      <FormGroup
        helperText={constant('Enter a name.')}
        intent={constant('danger')}
        label={constant('Name')}
        labelFor={'form-group-name'}
        labelInfo={constant('(required)')}
      >
        <InputGroup
          id={'form-group-name'}
          intent={'danger'}
          value={constant('')}
        />
      </FormGroup>
    ),
  ],
  [
    'FormGroup with no label or helper text',
    {
      element: () =>
        h(
          Blueprint.FormGroup,
          { helperText: '', label: '' },
          h(Blueprint.InputGroup, { value: 'x', onChange: ignore }),
        ),
      deliberate: [],
    },
    () => (
      <FormGroup helperText={constant('')} label={constant('')}>
        <InputGroup value={constant('x')} />
      </FormGroup>
    ),
  ],
  [
    'ControlGroup',
    {
      element: () =>
        h(
          Blueprint.ControlGroup,
          { fill: true },
          h(Blueprint.InputGroup, { value: 'x', onChange: ignore }),
          h(Blueprint.Button, { icon: 'plus' }),
        ),
      deliberate: [],
    },
    () => (
      <ControlGroup fill={true}>
        <InputGroup value={constant('x')} />
        <Button icon={'plus'} />
      </ControlGroup>
    ),
  ],
  [
    'InputGroup with a right element',
    {
      element: () =>
        h(Blueprint.InputGroup, {
          value:
            'someone.with.an.address.long.enough.to.run.under.the.button@example.com',
          intent: 'primary',
          onChange: ignore,
          // Wider than the 30px Blueprint's style sheets pad by, so that only
          // the padding measured from it keeps the text clear of it.
          rightElement: h(Blueprint.Button, {
            icon: 'cross',
            text: 'Clear',
            variant: 'minimal',
          }),
        }),
      deliberate: [],
    },
    () => (
      <InputGroup
        intent={'primary'}
        rightElement={
          <Button
            icon={'cross'}
            text={constant('Clear')}
            variant={constant('minimal')}
          />
        }
        value={constant(
          'someone.with.an.address.long.enough.to.run.under.the.button@example.com',
        )}
      />
    ),
  ],
  [
    'TextArea, filling and fitting its text',
    {
      element: () =>
        h(Blueprint.TextArea, {
          autoResize: true,
          fill: true,
          value: 'one\ntwo\nthree\nfour',
          onChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <TextArea
        autoResize={true}
        fill={true}
        value={constant('one\ntwo\nthree\nfour')}
      />
    ),
  ],
  [
    'TextArea with an intent and a placeholder',
    {
      element: () =>
        h(Blueprint.TextArea, {
          intent: 'primary',
          placeholder: 'Comments',
          value: '',
          onChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <TextArea
        intent={constant('primary')}
        placeholder={constant('Comments')}
        value={constant('')}
      />
    ),
  ],
  [
    'Switch',
    {
      element: () =>
        h(Blueprint.Switch, {
          label: 'Notify me',
          checked: true,
          inline: true,
          onChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <Switch
        checked={constant(true)}
        inline={true}
        label={constant('Notify me')}
        onChange={ignore}
      />
    ),
  ],
  [
    'Switch with no label, off',
    {
      element: () =>
        h(Blueprint.Switch, {
          'aria-label': 'Required',
          checked: false,
          onChange: ignore,
        }),
      deliberate: [],
    },
    () => (
      <Switch
        aria-label={constant('Required')}
        checked={constant(false)}
        onChange={ignore}
      />
    ),
  ],
  [
    'NonIdealState',
    {
      element: () =>
        h(Blueprint.NonIdealState, {
          icon: 'search',
          title: 'Not found',
          action: h(Blueprint.Button, { text: 'Back' }),
        }),
      deliberate: [],
    },
    () => (
      <NonIdealState
        action={<Button text={constant('Back')} />}
        icon={'search'}
        title={constant('Not found')}
      />
    ),
  ],
  [
    'NonIdealState with a description',
    {
      element: () =>
        h(Blueprint.NonIdealState, {
          icon: 'error',
          title: 'Something went wrong',
          description: h('div', null, 'Reload the page.'),
        }),
      deliberate: [],
    },
    () => (
      <NonIdealState
        description={<div>{constant('Reload the page.')}</div>}
        icon={'error'}
        title={constant('Something went wrong')}
      />
    ),
  ],
] as const;
