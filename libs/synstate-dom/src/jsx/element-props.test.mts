import { expectType } from 'ts-data-forge';
import type { Bindable } from '../constant/index.mjs';
import type {
  CommonElementProps,
  GeneratedIntrinsicElements,
  HtmlElementProps,
} from './element-props.mjs';
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

describe('the keys left out of one element (#3418)', () => {
  test("<style>'s `disabled`, which has no attribute, is left out", () => {
    expectType<
      'disabled' extends keyof GeneratedIntrinsicElements['style']
        ? true
        : false,
      false
    >('=');

    expectType<
      'disabled' extends keyof HtmlElementProps<HTMLStyleElement>
        ? true
        : false,
      false
    >('=');

    assert.isTrue(true);
  });

  test('the other keys of <style>, and `disabled` of any other element, stay in', () => {
    expectType<
      'media' extends keyof GeneratedIntrinsicElements['style'] ? true : false,
      true
    >('=');

    expectType<
      'disabled' extends keyof GeneratedIntrinsicElements['link']
        ? true
        : false,
      true
    >('=');

    expectType<
      'disabled' extends keyof GeneratedIntrinsicElements['button']
        ? true
        : false,
      true
    >('=');

    assert.isTrue(true);
  });
});
