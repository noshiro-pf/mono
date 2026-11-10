import { createState } from 'synstate';
import { createMountable, render } from 'synstate-dom';
import { Obj, unknownToString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  commonPropertyKeys,
  commonReflectedKeys,
  propertyKeysByTag,
  reflectedKeysByTag,
} from './reflected-keys.generated.mjs';

// Every key the props of an HTML element admit as an attribute, bound to a
// value, gives the element the property that writing the value to the property
// gives (#3000). A key with no attribute behind it, as `selectedIndex` was
// (#2934), leaves the property as it was. Bound to `undefined` after that, it
// gives the property back as it was, and bound to the value again, the value.
// The keys are listed by `gen:reflected-keys`, so a TypeScript update that
// admits a new one is tested here as soon as `ws:gen` has run.
describe('every key the element props admit as an attribute', () => {
  test.each(Object.entries(reflectedKeysByTag))('<%s>', (tag, tagKeys) => {
    const keys = [...commonReflectedKeys, ...tagKeys].filter(
      (key) => !setAside.has(`${tag}.${key}`),
    );

    assert.deepStrictEqual(keyFailures(tag, keys, 'attribute'), []);
  });
});

// Every key the props of an HTML element admit that is written as a property
// (`propertyNames`), bound to a value, gives the element the property that
// writing the value to the property gives; bound to the value the property had,
// that value again (#3448). That an entry of `propertyNames` is admitted by
// some tag is checked by `gen:reflected-keys`.
describe('every key the element props admit that is written as a property', () => {
  test.each(Object.entries(propertyKeysByTag))('<%s>', (tag, tagKeys) => {
    const keys = [...commonPropertyKeys, ...tagKeys].filter(
      (key) => !setAside.has(`${tag}.${key}`),
    );

    assert.deepStrictEqual(keyFailures(tag, keys, 'property'), []);
  });
});

describe('the samples, pairs set aside and attributes the tests above read', () => {
  test('every sample names a listed key, and every pair set aside or given attributes a listed pair', () => {
    const listedKeys = new Set<string>([
      ...commonReflectedKeys,
      ...Object.values(reflectedKeysByTag).flat(),
      ...commonPropertyKeys,
      ...Object.values(propertyKeysByTag).flat(),
    ]);

    assert.deepStrictEqual(
      [
        ...Array.from(samples.keys()).filter(
          (name) => !listedKeys.has(name) && !listedPairs.has(name),
        ),
        ...[...setAside, ...attributesFor.keys()].filter(
          (name) => !listedPairs.has(name),
        ),
      ],
      [],
    );
  });

  // An attribute a pair does not need, its own attribute among them, would hide
  // how the key behaves on an element without it.
  test('every attribute set is for a pair not set aside, and each of its attributes is needed', () => {
    const unneeded = Array.from(attributesFor).flatMap(([name, attributes]) => {
      if (setAside.has(name)) {
        return [name];
      }

      const [tag = '', key = ''] = name.split('.', 2);

      return Object.keys(attributes)
        .filter((attribute) => {
          const write = propertyWrite(
            tag,
            key,
            Obj.filter(attributes, (_value, other) => other !== attribute),
          );

          // A write refused without the attribute needs it.
          return (
            write.refused === undefined &&
            !Object.is(write.expected, write.before)
          );
        })
        .map((attribute) => `${name}: ${attribute}`);
    });

    assert.deepStrictEqual(unneeded, []);
  });
});

const samples: ReadonlyMap<string, unknown> = new Map<string, unknown>([
  ['as', 'script'],
  ['autocapitalize', 'words'],
  ['autocomplete', 'off'],
  ['button.type', 'reset'],
  ['closedBy', 'any'],
  ['command', 'show-modal'],
  ['contentEditable', 'true'],
  ['decoding', 'async'],
  ['dir', 'rtl'],
  ['encoding', 'text/plain'],
  ['enctype', 'text/plain'],
  ['enterKeyHint', 'go'],
  ['fetchPriority', 'high'],
  ['input.type', 'number'],
  ['inputMode', 'numeric'],
  ['loading', 'lazy'],
  // At most `max`, which is 1.
  ['meter.high', 0.5],
  ['method', 'dialog'],
  ['popover', 'auto'],
  ['popoverTargetAction', 'show'],
  ['preload', 'none'],
  ['referrerPolicy', 'no-referrer'],
  ['scope', 'row'],
  ['shadowRootMode', 'open'],
  ['writingSuggestions', 'false'],
  // URLs that fetch nothing.
  ['poster', 'about:blank'],
  ['src', 'about:blank'],
  ['srcset', 'about:blank'],
]);

/** `tag.key` pairs these tests cannot judge. */
const setAside: ReadonlySet<string> = new Set<string>([
  // Chromium has no such property; the attribute is what a browser that has one
  // reads.
  'input.capture',
  // Keeps only the value of one of its options: "a select takes the value of
  // one of its options" in `bindings.test.tsx` binds it to another option's
  // value, to the one it had, and to the other again.
  'select.value',
]);

/** Every `tag.key` pair the generated lists name. */
const listedPairs: ReadonlySet<string> = new Set<string>([
  ...Object.entries(reflectedKeysByTag).flatMap(([tag, keys]) =>
    [...commonReflectedKeys, ...keys].map((key) => `${tag}.${key}`),
  ),
  ...Object.entries(propertyKeysByTag).flatMap(([tag, keys]) =>
    [...commonPropertyKeys, ...keys].map((key) => `${tag}.${key}`),
  ),
]);

/**
 * The attributes a `tag.key` pair has an effect only with, set with
 * `setAttribute` on the element before the key is bound, on the elements the
 * expected values are read from as on the bound one.
 */
const attributesFor: ReadonlyMap<
  string,
  ReadonlyRecord<string, string>
> = new Map<string, ReadonlyRecord<string, string>>([
  // The size the image button is drawn at: 0 for any other `type`.
  ['input.height', { type: 'image' }],
  ['input.width', { type: 'image' }],
]);

/** `element`, with `attributes` set on it. */
const withAttributes = <E extends Element>(
  element: E,
  attributes: ReadonlyRecord<string, string>,
): E => {
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }

  return element;
};

/**
 * A value for `key` that the property keeps: the other boolean, 3, or a string,
 * `samples` naming the ones an enumerated attribute or a setter that throws
 * needs.
 */
const sampleOf = (tag: string, key: string, before: unknown): unknown =>
  samples.get(`${tag}.${key}`) ??
  samples.get(key) ??
  (typeof before === 'boolean'
    ? !before
    : typeof before === 'number'
      ? 3
      : 'x');

/**
 * What `key` of a new `tag` with `attributes` reads, the value it is given, and
 * what it reads after the value is written to it; or why the value was refused.
 */
const propertyWrite = (
  tag: string,
  key: string,
  attributes: ReadonlyRecord<string, string>,
): Readonly<
  | {
      refused: undefined;
      before: unknown;
      value: unknown;
      expected: unknown;
    }
  | { refused: string; value: unknown }
> => {
  const before: unknown = Reflect.get(
    withAttributes(document.createElement(tag), attributes),
    key,
  );

  const value = sampleOf(tag, key, before);

  const written = withAttributes(document.createElement(tag), attributes);

  try {
    Reflect.set(written, key, value);
  } catch (error) {
    return { refused: unknownToString(error), value };
  }

  return {
    refused: undefined,
    before,
    value,
    expected: Reflect.get(written, key),
  };
};

/**
 * What goes wrong when `key` is bound to `value`, to `other`, then to `value`
 * again: the property should read `expected`, `before`, then `expected`, as the
 * attribute comes and goes (`other` is `undefined`) or the property is written
 * back (`other` is `before`).
 */
const bindingFailures = (
  tag: string,
  key: string,
  attributes: ReadonlyRecord<string, string>,
  {
    value,
    expected,
    other,
    before,
    dirty,
  }: Readonly<{
    value: unknown;
    expected: unknown;
    other: unknown;
    before: unknown;
    dirty: boolean;
  }>,
): readonly string[] => {
  const label = dirty ? (`${key} (property written first)` as const) : key;

  const container = document.createElement('div');

  const [value$, setValue] = createState<unknown>(value);

  let mut_unmount: (() => void) | undefined = undefined;

  try {
    mut_unmount = render(
      () =>
        createMountable(tag, {
          // `ref` is called before anything is bound.
          ref: (created: Element) => {
            withAttributes(created, attributes);

            if (dirty) {
              // Writing the property, as a user's input does, parts `value`,
              // `checked` and `selected` from their attributes (the dirty value,
              // checkedness and selectedness flags), so one written as an
              // attribute is not read back. It also clears a script's
              // force-async flag, which only a clean element shows.
              Reflect.set(created, key, Reflect.get(created, key));
            }
          },
          [key]: value$,
        }),
      container,
    );

    const element = container.firstElementChild;

    if (element === null) {
      return [`${label}: <${tag}> was not rendered`];
    }

    const bound: unknown = Reflect.get(element, key);

    setValue(other);

    const removed: unknown = Reflect.get(element, key);

    setValue(value);

    const rebound: unknown = Reflect.get(element, key);

    return [
      ...(Object.is(bound, expected)
        ? []
        : [
            `${label}: bound to ${JSON.stringify(value)}, reads ${JSON.stringify(bound)}, not ${JSON.stringify(expected)}`,
          ]),
      ...(Object.is(removed, before)
        ? []
        : [
            `${label}: bound to ${JSON.stringify(other)}, reads ${JSON.stringify(removed)}, not ${JSON.stringify(before)}`,
          ]),
      ...(Object.is(rebound, expected)
        ? []
        : [
            `${label}: bound to ${JSON.stringify(value)} again, reads ${JSON.stringify(rebound)}, not ${JSON.stringify(expected)}`,
          ]),
    ];
  } catch (error) {
    return [`${label}: binding throws (${unknownToString(error)})`];
  } finally {
    mut_unmount?.();
  }
};

/**
 * What goes wrong when each of `keys` of `tag` is bound to a value, to another,
 * and to the first value again. The other is `undefined` for a key written as
 * an attribute, which removes it, and the value the property had for one
 * written as a property, bound both on a new element and on one whose property
 * has been written.
 */
const keyFailures = (
  tag: string,
  keys: readonly string[],
  writtenAs: 'attribute' | 'property',
): readonly string[] =>
  keys.flatMap((key) => {
    // Written and read back, a property the element does not have would be an
    // expando that passes.
    if (!Reflect.has(document.createElement(tag), key)) {
      return [`${key}: <${tag}> has no such property`];
    }

    const attributes = attributesFor.get(`${tag}.${key}`) ?? {};

    const write = propertyWrite(tag, key, attributes);

    if (write.refused !== undefined) {
      return [
        `${key}: ${JSON.stringify(write.value)} is refused (${write.refused}); give a value in \`samples\``,
      ];
    }

    const { before, value, expected } = write;

    if (Object.is(expected, before)) {
      return [
        `${key}: ${JSON.stringify(value)} leaves the property as it was; give a value in \`samples\``,
      ];
    }

    // A key written as a property is bound on a clean element and on one whose
    // property has been written.
    return (writtenAs === 'attribute' ? [false] : [false, true]).flatMap(
      (dirty) =>
        bindingFailures(tag, key, attributes, {
          value,
          expected,
          other: writtenAs === 'attribute' ? undefined : before,
          before,
          dirty,
        }),
    );
  });
