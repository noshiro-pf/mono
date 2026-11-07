import { expectType } from 'ts-data-forge';
import type { Bindable } from '../constant.mjs';
import type { CommonElementProps } from './element-props.mjs';
import type { EventPropNames } from './event-prop-names.mjs';

// synstate-dom's `src/jsx/element-props.test.mts`.

describe('EventPropNames', () => {
  test('names every event of HTML and SVG elements', () => {
    expectType<
      keyof EventPropNames,
      keyof HTMLElementEventMap | keyof SVGElementEventMap
    >('=');

    assert.isTrue(true);
  });

  test('lower-casing a prop name gives its event name back', () => {
    expectType<
      {
        [K in keyof EventPropNames]: Lowercase<
          EventPropNames[K]
        > extends `on${K}`
          ? true
          : false;
      }[keyof EventPropNames],
      true
    >('=');

    assert.isTrue(true);
  });
});

describe('CommonElementProps', () => {
  test('an aria-* attribute takes a boolean and a number, a data-* one neither (#3165)', () => {
    expectType<
      CommonElementProps<HTMLElement>['aria-busy'],
      Bindable<boolean | number | string | undefined> | undefined
    >('=');

    expectType<
      CommonElementProps<HTMLElement>['data-row'],
      Bindable<string | undefined> | undefined
    >('=');

    assert.isTrue(true);
  });
});
