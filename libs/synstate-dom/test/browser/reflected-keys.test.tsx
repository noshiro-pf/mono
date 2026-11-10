import { createState } from 'synstate';
import { createMountable, render } from 'synstate-dom';
import { Obj, unknownToString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  commonReflectedKeys,
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
      (key) => !notReflected.has(`${tag}.${key}`),
    );

    const mut_failures: string[] = [];

    for (const key of keys) {
      const attributes = attributesFor.get(`${tag}.${key}`) ?? {};

      const write = propertyWrite(tag, key, attributes);

      if (write.refused !== undefined) {
        mut_failures.push(
          `${key}: ${JSON.stringify(write.value)} is refused (${write.refused}); give a value in \`samples\``,
        );

        continue;
      }

      const { before, value, expected } = write;

      if (Object.is(expected, before)) {
        mut_failures.push(
          `${key}: ${JSON.stringify(value)} leaves the property as it was; give a value in \`samples\``,
        );

        continue;
      }

      mut_failures.push(
        ...bindingFailures(tag, key, attributes, value, expected, before),
      );
    }

    assert.deepStrictEqual(mut_failures, []);
  });

  test('every sample names a listed key, and every pair set aside or attribute set a listed pair', () => {
    const pairs = new Set<string>(
      Object.entries(reflectedKeysByTag).flatMap(([tag, keys]) =>
        [...commonReflectedKeys, ...keys].map((key) => `${tag}.${key}`),
      ),
    );

    const listedKeys = new Set<string>([
      ...commonReflectedKeys,
      ...Object.values(reflectedKeysByTag).flat(),
    ]);

    assert.deepStrictEqual(
      [
        ...Array.from(samples.keys()).filter(
          (name) => !listedKeys.has(name) && !pairs.has(name),
        ),
        ...[...notReflected, ...attributesFor.keys()].filter(
          (name) => !pairs.has(name),
        ),
      ],
      [],
    );
  });

  // An attribute a pair does not need, its own attribute among them, would hide
  // how the key behaves on an element without it.
  test('every attribute set is for a pair not set aside, and each of its attributes is needed', () => {
    const unneeded = Array.from(attributesFor).flatMap(([name, attributes]) => {
      if (notReflected.has(name)) {
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

/** `tag.key` pairs this test cannot judge. */
const notReflected: ReadonlySet<string> = new Set<string>([
  // Chromium has no such property; the attribute is what a browser that has one
  // reads.
  'input.capture',
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
 * What goes wrong when `key` is bound to `value`, to `undefined`, then to
 * `value` again: the property should read `expected`, `before`, then
 * `expected`, as the attribute comes and goes.
 */
const bindingFailures = (
  tag: string,
  key: string,
  attributes: ReadonlyRecord<string, string>,
  value: unknown,
  expected: unknown,
  before: unknown,
): readonly string[] => {
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
          },
          [key]: value$,
        }),
      container,
    );

    const element = container.firstElementChild;

    if (element === null) {
      return [`${key}: <${tag}> was not rendered`];
    }

    const bound: unknown = Reflect.get(element, key);

    setValue(undefined);

    const removed: unknown = Reflect.get(element, key);

    setValue(value);

    const rebound: unknown = Reflect.get(element, key);

    return [
      ...(Object.is(bound, expected)
        ? []
        : [
            `${key}: bound to ${JSON.stringify(value)}, reads ${JSON.stringify(bound)}, not ${JSON.stringify(expected)}`,
          ]),
      ...(Object.is(removed, before)
        ? []
        : [
            `${key}: bound to undefined, reads ${JSON.stringify(removed)}, not ${JSON.stringify(before)}`,
          ]),
      ...(Object.is(rebound, expected)
        ? []
        : [
            `${key}: bound to ${JSON.stringify(value)} again, reads ${JSON.stringify(rebound)}, not ${JSON.stringify(expected)}`,
          ]),
    ];
  } catch (error) {
    return [`${key}: binding throws (${unknownToString(error)})`];
  } finally {
    mut_unmount?.();
  }
};
