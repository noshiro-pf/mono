// cspell:ignore oklab oklch currentcolor

import * as fs from 'node:fs';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';

/**
 * The page's colours are tokens on `:root`, one block per theme (spec L12), so
 * a colour written anywhere else is one the other theme never gets.
 */
describe('src/page/style.css', () => {
  test('the tokens are two blocks: the dark default, then the light one', () => {
    const css = stylesheet();

    expect(css.match(rootBlock)).toHaveLength(2);

    const media = css.search(
      /@media\s*\(prefers-color-scheme:\s*light\)\s*\{\s*:root\s*\{/u,
    );

    assert.isAbove(media, css.search(rootBlock));
  });

  test('no colour is written outside the token blocks', () => {
    expect(
      declarationsOutside().filter(([, value]) => colourLiteral.test(value)),
    ).toStrictEqual([]);
  });

  test('a colour property outside the token blocks takes only tokens', () => {
    const strays = declarationsOutside()
      .filter(([property]) => isColourProperty(property))
      .filter(([, value]) =>
        value
          .replaceAll(/var\(\s*--sv-[\w-]+\s*\)/gu, '')
          .split(/\s+/u)
          .some((word) => !(word === '' || notAColour.test(word))),
      );

    expect(strays).toStrictEqual([]);
  });

  test('the light theme sets every dark token but those of both themes', () => {
    const [dark, light] = stylesheet().match(rootBlock) ?? [];

    assert.isDefined(dark);

    assert.isDefined(light);

    expect(tokensSetIn(light).toSorted()).toStrictEqual(
      tokensSetIn(dark)
        .filter((token) => !themeIndependent.includes(token))
        .toSorted(),
    );
  });

  test('every token used is one the dark theme sets', () => {
    const css = stylesheet();

    const [dark] = css.match(rootBlock) ?? [];

    assert.isDefined(dark);

    const darkTokens = tokensSetIn(dark);

    // A fallback included: one would hide a misspelt token.
    const used = Array.from(
      css.matchAll(/(?<=var\(\s*)--[\w-]+/gu),
      (m) => m[0],
    );

    expect(used.filter((token) => !darkTokens.includes(token))).toStrictEqual(
      [],
    );
  });
});

const rootBlock = /:root\s*\{[^{}]*\}/gu;

const colourLiteral =
  /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/iu;

/** The tokens the light theme does not set, because both themes share them. */
const themeIndependent = [
  '--sv-gutter',
  '--sv-bar-height',
  '--sv-frame-bg',
] as const;

const borderSides = [
  '',
  '-top',
  '-right',
  '-bottom',
  '-left',
  '-block',
  '-block-start',
  '-block-end',
  '-inline',
  '-inline-start',
  '-inline-end',
] as const;

const colourProperties: ReadonlySet<string> = new Set<string>([
  ...borderSides.flatMap((side) => [`border${side}`, `border${side}-color`]),
  'color',
  'background',
  'background-color',
  'outline',
  'outline-color',
  'column-rule',
  'column-rule-color',
  'box-shadow',
  'text-shadow',
  'text-decoration',
  'text-decoration-color',
  'text-emphasis',
  'text-emphasis-color',
  'caret-color',
  'accent-color',
  'scrollbar-color',
  'text-fill-color',
  'text-stroke',
  'text-stroke-color',
  'fill',
  'stroke',
  'stop-color',
  'flood-color',
  'lighting-color',
]);

/** A word in such a value that is not a colour: a length, a style, a keyword. */
const notAColour =
  /^(?:-?[\d.]+(?:px|em|rem|%)?|none|solid|dashed|dotted|double|inset|underline|overline|line-through|transparent|currentcolor|inherit)$/iu;

/**
 * What can carry a colour: the properties that take one, and any custom
 * property, which outside the token blocks would be a token the light theme
 * never sets.
 */
const isColourProperty = (property: string): boolean =>
  property.startsWith('--') ||
  colourProperties.has(property.replace(/^-webkit-/u, ''));

/** The stylesheet without its comments, which may name colours. */
const stylesheet = (): string =>
  fs
    .readFileSync(
      path.resolve(import.meta.dirname, '../src/page/style.css'),
      'utf8',
    )
    .replaceAll(/\/\*[\s\S]*?\*\//gu, '');

/**
 * Each declaration outside the token blocks, as property and value, read from
 * the rule bodies only, so that a selector is never taken for one.
 */
const declarationsOutside = (): readonly (readonly [string, string])[] =>
  Array.from(
    stylesheet()
      .replaceAll(rootBlock, '')
      .matchAll(/\{([^{}]*)\}/gu),
    (m) => m[1] ?? '',
  )
    .flatMap((body) => body.split(';'))
    .map((declaration) => declaration.split(':'))
    .filter((parts) => Arr.isMinLengthArray(2, parts))
    .map(
      ([property = '', ...value]) =>
        [property.trim(), value.join(':').trim()] as const,
    );

const tokensSetIn = (block: string): readonly string[] =>
  Array.from(block.matchAll(/--sv-[\w-]+(?=\s*:)/gu), (m) => m[0]);
