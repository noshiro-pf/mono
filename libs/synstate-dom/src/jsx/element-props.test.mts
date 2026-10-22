import { expectType } from 'ts-data-forge';
import type { EventPropNames } from './event-prop-names.mjs';

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
