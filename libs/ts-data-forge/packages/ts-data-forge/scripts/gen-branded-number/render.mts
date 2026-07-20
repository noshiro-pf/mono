import { Arr } from 'ts-data-forge';
import { type BrandedNumberConfig } from './config.mjs';
import { methodProse, type MethodProse } from './prose.mjs';

/** Renders a complete branded-number module from its config. */
export const renderModule = (config: BrandedNumberConfig): string =>
  [
    renderImports(config),
    '',
    `export type ${config.pascalName} = TtfImported_${config.ttfType};`,
    '',
    `type ElementType = ${config.elementTypeRhs};`,
    '',
    `const typeNameInMessage = '${config.typeNameInMessage}';`,
    '',
    renderFactoryCall(config),
    ...(config.customConsts !== undefined ? ['', config.customConsts] : []),
    '',
    renderTopLevel(config, 'guard'),
    '',
    renderTopLevel(config, 'cast'),
    '',
    renderNamespace(config),
    ...renderExpectType(config),
    '',
  ].join('\n');

const renderImports = (config: BrandedNumberConfig): string =>
  [
    `import { type ${config.ttfType} as TtfImported_${config.ttfType} } from 'ts-type-forge';`,
    // Emitted as separate statements; `prettier-plugin-organize-imports` merges
    // and sorts them into the single `ts-type-forge` import.
    ...(config.extraTtfTypes ?? []).map(
      (t) => `import { type ${t} } from 'ts-type-forge';`,
    ),
    ...(config.extraImports ?? []),
    ...(config.numberClassParams !== undefined
      ? [`import { expectType } from '../../expect-type.mjs';`]
      : []),
    `import { TsDataForgeInternals } from '../refined-number-utils.mjs';`,
  ].join('\n');

const renderFactoryCall = (config: BrandedNumberConfig): string => {
  const destructured = destructureEntries(config)
    .map((e) =>
      e.factoryOp === e.localName
        ? `  ${e.factoryOp},`
        : `  ${e.factoryOp}: ${e.localName},`,
    )
    .join('\n');

  const configEntries = [
    ...(config.integerOrSafeInteger !== undefined
      ? [`  integerOrSafeInteger: '${config.integerOrSafeInteger}',`]
      : []),
    ...(config.nonZero ? ['  nonZero: true,'] : []),
    ...(config.minValueComment !== undefined
      ? [`  ${config.minValueComment}`]
      : []),
    `  MIN_VALUE: ${config.minValueExpr},`,
    ...(config.maxValueComment !== undefined
      ? [`  ${config.maxValueComment}`]
      : []),
    `  MAX_VALUE: ${config.maxValueExpr},`,
    '  typeNameInMessage,',
  ].join('\n');

  return [
    'const {',
    destructured,
    `} = TsDataForgeInternals.RefinedNumberUtils.${config.factory}<`,
    config.generics.map((g) => `  ${g}`).join(',\n'),
    '>({',
    configEntries,
    '} as const);',
  ].join('\n');
};

const renderTopLevel = (
  config: BrandedNumberConfig,
  which: 'guard' | 'cast',
): string => {
  const prose = methodProse(which === 'guard' ? 'topGuard' : 'topCast', config);

  const decl =
    which === 'guard'
      ? (`export const is${config.pascalName} = is;` as const)
      : (`export const as${config.pascalName} = castType;` as const);

  return [
    renderJsDoc(prose, 0, config.hasExamples && prose.hasExample),
    decl,
  ].join('\n');
};

const renderNamespace = (config: BrandedNumberConfig): string => {
  const members = config.namespaceKeys
    .map((key: string) => {
      const prose = methodProse(key, config);

      const localName = namespaceLocalName(key);

      const member =
        localName === key
          ? (`  ${key},` as const)
          : (`  ${key}: ${localName},` as const);

      return [
        renderJsDoc(prose, 1, config.hasExamples && prose.hasExample),
        member,
      ].join('\n');
    })
    .join('\n\n');

  return [
    renderJsDoc(methodProse('namespace', config), 0, false),
    `export const ${config.pascalName} = {`,
    members,
    '} as const;',
  ].join('\n');
};

const renderExpectType = (config: BrandedNumberConfig): readonly string[] => {
  if (config.numberClassParams === undefined) return [];

  const numberClass = [
    'TsDataForgeInternals.RefinedNumberUtils.NumberClass<',
    '    ElementType,',
    `    ${config.numberClassParams}`,
    '  >',
  ].join('\n');

  return [
    '',
    `expectType<keyof typeof ${config.pascalName}, keyof ${numberClass}>('=');`,
    '',
    `expectType<typeof ${config.pascalName}, ${numberClass}>('<=');`,
  ];
};

// ---------------------------------------------------------------------------
// JSDoc rendering with prose wrapping
// ---------------------------------------------------------------------------

const renderJsDoc = (
  prose: MethodProse,
  indentLevel: number,
  withExample: boolean,
): string => {
  const indent = '  '.repeat(indentLevel);

  const textWidth = 80 - indent.length - 3; // account for ` * `

  const descriptionLines = prose.description
    .split('\n\n')
    .map((para) => (para === '' ? [''] : wrapText(para, textWidth)))
    .reduce<readonly string[]>(
      (acc, para, index) => (index === 0 ? para : [...acc, '', ...para]),
      [],
    );

  const tagLines = [
    ...prose.params.map((p) => `@param ${p.name} - ${p.desc}`),
    ...(prose.returns !== undefined
      ? ([`@returns ${prose.returns}`] as const)
      : ([] as const)),
    ...(prose.throws !== undefined
      ? ([`@throws ${prose.throws}`] as const)
      : ([] as const)),
    ...(prose.see !== undefined
      ? ([`@see ${prose.see}`] as const)
      : ([] as const)),
  ] as const;

  const body: readonly string[] = [
    ...descriptionLines,
    ...(withExample
      ? (['', '@example', '', '```ts', '```'] as const)
      : ([] as const)),
    ...(Arr.isNonEmpty(tagLines) ? ([''] as const) : ([] as const)),
    ...tagLines,
  ] as const;

  return [
    `${indent}/**`,
    ...body.map((line) =>
      line === '' ? `${indent} *` : `${indent} * ${line}`,
    ),
    `${indent} */`,
  ].join('\n');
};

const wrapText = (text: string, width: number): readonly string[] => {
  const words = text.split(' ');

  const { lines, current } = words.reduce<
    Readonly<{
      lines: readonly string[];
      current: string;
    }>
  >(
    (acc, word) => {
      if (acc.current === '') return { lines: acc.lines, current: word };

      const candidate = `${acc.current} ${word}` as const;

      return candidate.length <= width
        ? { lines: acc.lines, current: candidate }
        : { lines: [...acc.lines, acc.current], current: word };
    },
    { lines: [], current: '' },
  );

  return current === '' ? lines : [...lines, current];
};

// ---------------------------------------------------------------------------
// Structural helpers
// ---------------------------------------------------------------------------

type DestructureEntry = Readonly<{ factoryOp: string; localName: string }>;

const destructureEntries = (
  config: BrandedNumberConfig,
): readonly DestructureEntry[] => {
  const customKeys = new Set(config.customKeys);

  const fromKeys = config.namespaceKeys
    .filter((key: string) => !customKeys.has(key))
    .map((key: string) => ({
      factoryOp: factoryOpFor(key, config.randomNonZero ?? false),
      localName: namespaceLocalName(key),
    }));

  const all = [
    ...fromKeys,
    { factoryOp: 'castType', localName: 'castType' },
  ] as const;

  const deduped = all.filter(
    (e, i) => all.findIndex((x) => x.factoryOp === e.factoryOp) === i,
  );

  // Code-unit (ASCII) order to match the hand-written destructuring in the
  // source modules; `localeCompare` would reorder the upper-case constants.
  // eslint-disable-next-line unicorn/prefer-simple-sort-comparator
  return deduped.toSorted((a, b) => (a.factoryOp < b.factoryOp ? -1 : 1));
};

const factoryOpFor = (key: string, nonZero: boolean): string =>
  key === 'random' ? (nonZero ? 'randomNonZero' : 'random') : key;

const namespaceLocalName = (key: string): string =>
  key === 'min' ? 'min_' : key === 'max' ? 'max_' : key;
