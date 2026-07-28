import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { unknownToString } from 'ts-data-forge';
import { formatFiles, isDirectlyExecuted, Result } from 'ts-repo-utils';
import { extractSampleCode } from '../cmd/embed-examples-utils.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

// =============================================================================
// main
// =============================================================================

/**
 * Regenerates the branded **integer** type modules under
 * `src/branded-types/predefined-numbers/` (`int.mts`, `safe-int.mts`,
 * `int32.mts`, `int16.mts`, `uint32.mts`, `uint16.mts`).
 *
 * The set of types is derived from a single declarative spec ({@link families})
 * that crosses a **base** axis (`Int` / `SafeInt` / `Int32` / `Int16` /
 * `Uint32` / `Uint16`) with a **sign** axis (`any` / `>0` / `>=0` / `!=0` /
 * `<=0` / `<0`). Generating from one spec keeps the matrix symmetric by
 * construction: every meaningful base × sign combination is emitted, and the
 * intentionally-omitted unsigned cells (`Negative*`, `NonPositive*`,
 * `NonNegativeUint*`) are the only gaps.
 *
 * `@example` code blocks are inlined here from the type-checked sample files in
 * `samples/src/...` using the exact same extraction/indentation as
 * `pnpm run doc:embed:jsdoc`, so the two pipelines produce identical output and
 * the generator's result stays stable (no drift) under `pnpm run build`.
 *
 * Non-integer brands (`FiniteNumber`, `Float*`, `InfiniteNumber`, `NaNType`,
 * the sign-annotated `*Number` bases, `SmallInt` / `WithSmallInt` machinery)
 * are out of scope and remain hand-written.
 */
export const genNumberBrandTypes = async (
  srcDir: string,
): Promise<Result<undefined, string>> => {
  try {
    const outDir = path.resolve(srcDir, 'branded-types/predefined-numbers');

    const mut_writtenPaths: string[] = [];

    for (const family of families) {
      const content = await renderFamily(family);

      const filePath = path.resolve(outDir, family.file);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(filePath, content, 'utf8');

      mut_writtenPaths.push(filePath);

      console.log(`Generated ${path.relative(workspaceRootPath, filePath)}`);
    }

    await formatFiles(mut_writtenPaths);

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(
      `❌ Failed to generate number brand types: ${unknownToString(error)}`,
    );
  }
};

// =============================================================================
// spec (single source of truth)
// =============================================================================

/** The sign axis, in canonical emission order. */
type SignKey = '!=0' | '<=0' | '<0' | '>=0' | '>0' | 'any';

/** Order in which sign variants are emitted within each family. */
const signOrder = ['any', '!=0', '>=0', '>0', '<0', '<=0'] as const;

type SignInfo = Readonly<{
  /** Default type-name prefix (empty for the base type). */
  prefix: string;
  /** Adjective used in generated prose. */
  adj: string;
  /** The `*Number` brand this sign intersects with (empty for the base). */
  numberType: string;
  /** `WithSmallInt` literal-range description for this sign. */
  literals: string;
}>;

const signInfoMap: Readonly<Record<SignKey, SignInfo>> = {
  any: {
    prefix: '',
    adj: '',
    numberType: '',
    literals: '-40 | -39 | ... | 39',
  },
  '!=0': {
    prefix: 'NonZero',
    adj: 'non-zero',
    numberType: 'NonZeroNumber',
    literals: '-40 | ... | -1 | 1 | ... | 39',
  },
  '>=0': {
    prefix: 'NonNegative',
    adj: 'non-negative',
    numberType: 'NonNegativeNumber',
    literals: '0 | 1 | ... | 39',
  },
  '>0': {
    prefix: 'Positive',
    adj: 'positive',
    numberType: 'PositiveNumber',
    literals: '1 | 2 | ... | 39',
  },
  '<0': {
    prefix: 'Negative',
    adj: 'negative',
    numberType: 'NegativeNumber',
    literals: '-40 | -39 | ... | -1',
  },
  '<=0': {
    prefix: 'NonPositive',
    adj: 'non-positive',
    numberType: 'NonPositiveNumber',
    literals: '-40 | -39 | ... | 0',
  },
} as const;

type Bounds = Readonly<{
  minSym: string;
  maxSym: string;
  minDec: string;
  maxDec: string;
}>;

type AliasSpec = Readonly<{
  /** Alias type name, e.g. `Uint`. */
  name: string;
  /** Sign whose primary member this aliases. */
  ofSign: SignKey;
  /** Sample basename providing this alias's `@example`, if any. */
  example?: string;
}>;

type FamilySpec = Readonly<{
  file: string;
  /** Base type name (the `any` sign), e.g. `Int32`. */
  baseName: string;
  /** RHS of the base type definition. */
  baseDef: string;
  /** Base type description lines (excluding any auto-generated range line). */
  baseSummary: readonly string[];
  /**
   * Whether the base domain is already non-negative (`Uint*`). Controls the
   * `WithSmallInt` literal range of the base type (`0 | 1 | …` vs `-40 | …`).
   */
  unsigned?: boolean;
  /** Noun used in sign-variant prose, e.g. `32-bit signed integer`. */
  noun: string;
  /** Label used in `WithSmallInt` prose, e.g. `32-bit integer`. */
  smallLabel: string;
  /** Numeric bounds; when present, a `Range:` line is generated. */
  bounds?: Bounds;
  /** Sign variants to emit (the base `any` is always emitted). */
  signs: readonly SignKey[];
  /** Overrides the default name for a sign's primary member. */
  signNameOverride?: Partial<Readonly<Record<SignKey, string>>>;
  /** Sample basename providing each member's `@example`, keyed by sign. */
  signExample?: Partial<Readonly<Record<SignKey, string>>>;
  /** Extra alias types (both spellings are exported). */
  aliases?: readonly AliasSpec[];
}>;

const int32Bounds: Bounds = {
  minSym: '-2^31',
  maxSym: '2^31 - 1',
  minDec: '-2,147,483,648',
  maxDec: '2,147,483,647',
} as const;

const int16Bounds: Bounds = {
  minSym: '-2^15',
  maxSym: '2^15 - 1',
  minDec: '-32,768',
  maxDec: '32,767',
} as const;

const uint32Bounds: Bounds = {
  minSym: '0',
  maxSym: '2^32 - 1',
  minDec: '0',
  maxDec: '4,294,967,295',
} as const;

const uint16Bounds: Bounds = {
  minSym: '0',
  maxSym: '2^16 - 1',
  minDec: '0',
  maxDec: '65,535',
} as const;

const signedSigns = ['!=0', '>=0', '>0', '<0', '<=0'] as const;

const families: readonly FamilySpec[] = [
  {
    file: 'int.mts',
    baseName: 'Int',
    baseDef: "TSTypeForgeInternals_ExtendNumberBrand<FiniteNumber, 'Int'>",
    baseSummary: [
      'Branded numeric type for integers.',
      'Represents values that pass `Number.isInteger(x)` check.',
    ],
    noun: 'integer',
    smallLabel: 'integer',
    signs: signedSigns,
    signExample: {
      any: 'int-example.mts',
      '!=0': 'non-zero-int-example.mts',
      '>=0': 'non-negative-int-example.mts',
      '>0': 'positive-int-example.mts',
      '<0': 'negative-int-example.mts',
      '<=0': 'non-positive-int-example.mts',
    },
    aliases: [{ name: 'Uint', ofSign: '>=0', example: 'uint-example.mts' }],
  },
  {
    file: 'safe-int.mts',
    baseName: 'SafeInt',
    baseDef: "TSTypeForgeInternals_ExtendNumberBrand<Int, 'SafeInt'>",
    baseSummary: [
      'Branded numeric type for safe integers.',
      'Represents integers that can be exactly represented in JavaScript (±2^53 - 1).',
    ],
    noun: 'safe integer',
    smallLabel: 'safe integer',
    signs: signedSigns,
    signNameOverride: { '>=0': 'SafeUint' },
    signExample: {
      any: 'safe-int-example.mts',
      '!=0': 'non-zero-safe-int-example.mts',
      '>=0': 'safe-uint-example.mts',
      '>0': 'positive-safe-int-example.mts',
      '<0': 'negative-safe-int-example.mts',
      '<=0': 'non-positive-safe-int-example.mts',
    },
    aliases: [{ name: 'NonNegativeSafeInt', ofSign: '>=0' }],
  },
  {
    file: 'int32.mts',
    baseName: 'Int32',
    baseDef:
      "TSTypeForgeInternals_ExtendNumberBrand<SafeInt, '< 2^31' | '< 2^32' | '> -2^32' | '>= -2^31'>",
    baseSummary: ['Branded numeric type for 32-bit signed integers.'],
    noun: '32-bit signed integer',
    smallLabel: '32-bit integer',
    bounds: int32Bounds,
    signs: signedSigns,
    signExample: {
      any: 'int32-example.mts',
      '!=0': 'non-zero-int32-example.mts',
      '>=0': 'non-negative-int32-example.mts',
      '>0': 'positive-int32-example.mts',
      '<0': 'negative-int32-example.mts',
      '<=0': 'non-positive-int32-example.mts',
    },
  },
  {
    file: 'int16.mts',
    baseName: 'Int16',
    baseDef:
      "TSTypeForgeInternals_ExtendNumberBrand<Int32, '< 2^15' | '< 2^16' | '> -2^16' | '>= -2^15'>",
    baseSummary: ['Branded numeric type for 16-bit signed integers.'],
    noun: '16-bit signed integer',
    smallLabel: '16-bit integer',
    bounds: int16Bounds,
    signs: signedSigns,
    signExample: {
      any: 'int16-example.mts',
      '!=0': 'non-zero-int16-example.mts',
      '>=0': 'non-negative-int16-example.mts',
      '>0': 'positive-int16-example.mts',
      '<0': 'negative-int16-example.mts',
      '<=0': 'non-positive-int16-example.mts',
    },
  },
  {
    file: 'uint32.mts',
    baseName: 'Uint32',
    baseDef: "TSTypeForgeInternals_ExtendNumberBrand<SafeUint, '< 2^32'>",
    baseSummary: ['Branded numeric type for 32-bit unsigned integers.'],
    unsigned: true,
    noun: '32-bit unsigned integer',
    smallLabel: '32-bit unsigned integer',
    bounds: uint32Bounds,
    signs: ['>0'],
    signExample: {
      any: 'uint32-example.mts',
      '>0': 'positive-uint32-example.mts',
    },
    aliases: [
      {
        name: 'NonZeroUint32',
        ofSign: '>0',
        example: 'non-zero-uint32-example.mts',
      },
    ],
  },
  {
    file: 'uint16.mts',
    baseName: 'Uint16',
    baseDef:
      "TSTypeForgeInternals_ExtendNumberBrand<Uint32, '< 2^16' | '< 2^31'>",
    baseSummary: ['Branded numeric type for 16-bit unsigned integers.'],
    unsigned: true,
    noun: '16-bit unsigned integer',
    smallLabel: '16-bit unsigned integer',
    bounds: uint16Bounds,
    signs: ['>0'],
    signExample: {
      any: 'uint16-example.mts',
      '>0': 'positive-uint16-example.mts',
    },
    aliases: [
      {
        name: 'NonZeroUint16',
        ofSign: '>0',
        example: 'non-zero-uint16-example.mts',
      },
    ],
  },
] as const;

// =============================================================================
// rendering
// =============================================================================

/** A single `export type` declaration to emit, with its JSDoc. */
type Member = Readonly<{
  name: string;
  def: string;
  summary: readonly string[];
  /** Numeric sign of the value (drives the `WithSmallInt` literal range). */
  sign: SignKey;
  /** True for the family's base type (suppresses the sign adjective in prose). */
  isBase: boolean;
  /** Sample basename for the `@example` block, if any. */
  example?: string;
}>;

const sampleDir = 'samples/src/branded-types/predefined-numbers';

const renderFamily = async (family: FamilySpec): Promise<string> => {
  const members = buildMembers(family);

  const importBlock = buildImports(members);

  const mut_blocks: string[] = [header, importBlock];

  for (const member of members) {
    mut_blocks.push(await renderMember(member));
  }

  return `${mut_blocks.join('\n\n')}\n`;
};

/**
 * Expands a family spec into the ordered list of members: the base type, each
 * sign variant (with its alias emitted immediately after), and then all the
 * matching `…WithSmallInt` companions in the same order.
 */
const buildMembers = (family: FamilySpec): readonly Member[] => {
  const primaryName = (sign: SignKey): string =>
    family.signNameOverride?.[sign] ??
    `${signInfoMap[sign].prefix}${family.baseName}`;

  const mut_primaries: Member[] = [];

  for (const sign of signOrder) {
    if (sign !== 'any' && !family.signs.includes(sign)) continue;

    if (sign === 'any') {
      mut_primaries.push({
        name: family.baseName,
        def: family.baseDef,
        // The base of a `Uint*` family is itself non-negative.
        sign: family.unsigned === true ? '>=0' : 'any',
        isBase: true,
        summary: [...family.baseSummary, ...rangeLines(family, 'any')],
        example: family.signExample?.any,
      });

      continue;
    }

    const name = primaryName(sign);

    mut_primaries.push({
      name,
      def: `IntersectBrand<${family.baseName}, ${signInfoMap[sign].numberType}>`,
      sign,
      isBase: false,
      summary: buildSummary(family, sign),
      example: family.signExample?.[sign],
    });

    const aliasesForSign = (family.aliases ?? []).filter(
      (a) => a.ofSign === sign,
    );

    for (const alias of aliasesForSign) {
      mut_primaries.push({
        name: alias.name,
        def: name,
        sign,
        isBase: false,
        summary: buildAliasSummary(family, sign, name),
        example: alias.example,
      });
    }
  }

  // `WithSmallInt` companions, same order, no examples.
  const mut_small: Member[] = mut_primaries.map((m): Member => {
    // A member is an alias iff its def is a bare identifier (another member's name).
    const aliasTarget = mut_primaries.find((p) => p.name === m.def);

    return {
      name: `${m.name}WithSmallInt`,
      def:
        aliasTarget === undefined
          ? `WithSmallInt<${m.name}>`
          : `${aliasTarget.name}WithSmallInt`,
      sign: m.sign,
      isBase: m.isBase,
      summary: buildSmallSummary(
        family,
        m.sign,
        m.name,
        m.isBase,
        aliasTarget === undefined
          ? undefined
          : `${aliasTarget.name}WithSmallInt`,
      ),
    };
  });

  return [...mut_primaries, ...mut_small];
};

const buildSummary = (family: FamilySpec, sign: SignKey): readonly string[] => {
  /* cspell:disable-next-line */
  const article = /^[aeiou]/u.test(family.noun) ? 'an' : 'a';

  return [
    `Branded numeric type for ${signInfoMap[sign].adj} ${family.noun}s.`,
    `Represents ${article} ${family.noun} that is ${describeSign(sign)}.`,
    ...rangeLines(family, sign),
  ];
};

const buildAliasSummary = (
  family: FamilySpec,
  sign: SignKey,
  targetName: string,
): readonly string[] =>
  [
    `Alias for \`${targetName}\`.`,
    `Branded numeric type for ${signInfoMap[sign].adj} ${family.noun}s (${describeSign(sign)}).`,
    ...rangeLines(family, sign),
  ] as const;

const buildSmallSummary = (
  family: FamilySpec,
  sign: SignKey,
  memberName: string,
  isBase: boolean,
  aliasTargetSmallName: string | undefined,
): readonly string[] => {
  const label = smallLabelFor(family, sign, isBase);

  const typeLine =
    `Type: \`${signInfoMap[sign].literals} | ${memberName}\`` as const;

  if (aliasTargetSmallName !== undefined) {
    return [
      `Alias for \`${aliasTargetSmallName}\`.`,
      `${label} type with small literal values included.`,
      typeLine,
    ];
  }

  return [`${label} type with small literal values included.`, typeLine];
};

/** Capitalized `WithSmallInt` prose label, e.g. `Non-zero 32-bit integer`. */
const smallLabelFor = (
  family: FamilySpec,
  sign: SignKey,
  isBase: boolean,
): string => {
  const adj = isBase ? '' : signInfoMap[sign].adj;

  const base =
    adj === '' ? family.smallLabel : (`${adj} ${family.smallLabel}` as const);

  return `${base.charAt(0).toUpperCase()}${base.slice(1)}`;
};

const describeSign = (sign: SignKey): string => {
  switch (sign) {
    case '!=0':
      return 'not equal to zero';
    case '>=0':
      return 'greater than or equal to zero';
    case '>0':
      return 'strictly greater than zero';
    case '<0':
      return 'strictly less than zero';
    case '<=0':
      return 'less than or equal to zero';
    case 'any':
      return 'in range';
  }
};

/** The `Range: ...` JSDoc line(s) for a sized family, or none. */
const rangeLines = (family: FamilySpec, sign: SignKey): readonly string[] => {
  const b = family.bounds;

  if (b === undefined) return [];

  const { lowSym, highSym, lowDec, highDec, split } = rangeForSign(b, sign);

  if (split) {
    // Non-zero over a signed range: two disjoint intervals.
    return [`Range: [${b.minSym}, -1] ∪ [1, ${b.maxSym}]`];
  }

  return [`Range: [${lowSym}, ${highSym}] or [${lowDec}, ${highDec}]`];
};

type RangeParts = Readonly<{
  lowSym: string;
  highSym: string;
  lowDec: string;
  highDec: string;
  split: boolean;
}>;

const rangeForSign = (b: Bounds, sign: SignKey): RangeParts => {
  switch (sign) {
    case 'any':
      return f(b.minSym, b.maxSym, b.minDec, b.maxDec);
    case '>=0':
      return f('0', b.maxSym, '0', b.maxDec);
    case '>0':
      return f('1', b.maxSym, '1', b.maxDec);
    case '<0':
      return f(b.minSym, '-1', b.minDec, '-1');
    case '<=0':
      return f(b.minSym, '0', b.minDec, '0');
    case '!=0':
      return { ...f(b.minSym, b.maxSym, b.minDec, b.maxDec), split: true };
  }
};

const f = (
  lowSym: string,
  highSym: string,
  lowDec: string,
  highDec: string,
): RangeParts => ({ lowSym, highSym, lowDec, highDec, split: false }) as const;

const renderMember = async (member: Member): Promise<string> => {
  const mut_lines: string[] = ['/**'];

  for (const line of member.summary) {
    mut_lines.push(line === '' ? ' *' : ` * ${line}`);
  }

  if (member.example !== undefined) {
    const samplePath = path.resolve(
      workspaceRootPath,
      sampleDir,
      member.example,
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const raw = await fs.readFile(samplePath, 'utf8');

    const code = extractSampleCode(raw);

    mut_lines.push(' *', ' * @example', ' * ```ts');

    for (const line of code.split('\n')) {
      mut_lines.push(line.trim() === '' ? ' *' : ` * ${line}`);
    }

    mut_lines.push(' * ```');
  }

  mut_lines.push(' */', `export type ${member.name} = ${member.def};`);

  return mut_lines.join('\n');
};

// =============================================================================
// imports
// =============================================================================

const header =
  '/* AUTO-GENERATED. DO NOT EDIT. Regenerate with `pnpm run build`. */';

/** Symbol -> module specifier for the types the generated defs may reference. */
const symbolModules: Readonly<Record<string, string>> = {
  IntersectBrand: '../brand.mjs',
  TSTypeForgeInternals_ExtendNumberBrand: './_number-brand-internals.mjs',
  WithSmallInt: './small-int.mjs',
  NonZeroNumber: './core.mjs',
  NonNegativeNumber: './core.mjs',
  PositiveNumber: './core.mjs',
  NegativeNumber: './core.mjs',
  NonPositiveNumber: './core.mjs',
  FiniteNumber: './finite-number.mjs',
  Int: './int.mjs',
  SafeInt: './safe-int.mjs',
  SafeUint: './safe-int.mjs',
  Int32: './int32.mjs',
  Uint32: './uint32.mjs',
} as const;

/**
 * Builds the type-only import block, importing exactly the external symbols the
 * generated definitions reference (excluding names defined in this same file).
 */
const buildImports = (members: readonly Member[]): string => {
  const localNames = new Set(members.map((m) => m.name));

  // Distinct external symbols referenced by any definition, excluding names
  // defined in this same file.
  const referenced: readonly string[] = Array.from(
    new Set(
      members.flatMap((m) =>
        (m.def.match(/[A-Za-z_][A-Za-z0-9_]*/gu) ?? []).filter(
          (token) =>
            !localNames.has(token) && Object.hasOwn(symbolModules, token),
        ),
      ),
    ),
  );

  const specifiers: readonly string[] = Array.from(
    new Set(referenced.map((symbol) => symbolModules[symbol] ?? '')),
  ).toSorted((a, b) => a.localeCompare(b));

  return specifiers
    .map((specifier) => {
      const named = referenced
        .filter((symbol) => (symbolModules[symbol] ?? '') === specifier)
        .toSorted((a, b) => a.localeCompare(b))
        .map((symbol) => `type ${symbol}`)
        .join(', ');

      return `import { ${named} } from '${specifier}';`;
    })
    .join('\n');
};

// =============================================================================
// direct execution
// =============================================================================

if (isDirectlyExecuted(import.meta.url)) {
  const result = await genNumberBrandTypes(
    path.resolve(workspaceRootPath, 'src'),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
