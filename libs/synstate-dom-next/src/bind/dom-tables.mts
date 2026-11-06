import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * The keys written as DOM properties (`element[key] = value`) rather than as
 * attributes: the ones a user's input moves away from the attribute (`value`,
 * `checked`, …), the enumerated attributes whose `false` is a value rather than
 * an absence (`autocorrect`, `draggable`, `spellcheck`, `translate`), and
 * `async`, which a script made by `createElement` has on until the property
 * turns it off. The props types and the binding both read this table.
 */
export const propertyNames = [
  'async',
  'autocorrect',
  'checked',
  'defaultChecked',
  'defaultValue',
  'draggable',
  'indeterminate',
  'muted',
  'selected',
  'spellcheck',
  'translate',
  'value',
] as const;

/**
 * DOM property names whose attribute is spelt differently. Every other name is
 * passed to `setAttribute`, which lower-cases it for an HTML element
 * (`tabIndex` becomes `tabindex`).
 */
export const attributeNameOf: ReadonlyRecord<string, string> = {
  acceptCharset: 'accept-charset',
  defaultMuted: 'muted',
  defaultSelected: 'selected',
  encoding: 'enctype',
  htmlFor: 'for',
  httpEquiv: 'http-equiv',
} as const;
