import * as tsDataForge from 'ts-data-forge';
import { brandedNumberTypeNameToFunctionName } from '../../src/rules/branded-number-types.mjs';

/**
 * ts-data-forge reserves the `as<Type>` prefix exclusively for branded-number
 * cast functions (e.g. `asInt`, `asPositiveSafeInt`). We therefore treat every
 * public runtime export matching this pattern as a branded-number cast, and
 * require it to be represented in `brandedNumberTypeNameToFunctionName`.
 */
const AS_CAST_PATTERN = /^as[A-Z]/u;

const asPrefixLength = 'as'.length;

/**
 * Verifies that `src/rules/branded-number-types.mts` stays in sync with the
 * branded-number cast functions actually exported by ts-data-forge, so that
 * the `prefer-as-int` rule covers every branded number type (and never maps a
 * type to a cast function that no longer exists).
 */
const main = (): void => {
  // Source of truth: the public ts-data-forge runtime API. The whole namespace
  // is needed to enumerate its exports; tree-shaking is irrelevant for this
  // build-time script.
  // eslint-disable-next-line tree-shakable/import-star
  const actualCastFunctions = collectAsCastFunctionNames(tsDataForge);

  const expectedTypeNames = new Set(
    Array.from(actualCastFunctions, (fn) => fn.slice(asPrefixLength)),
  );

  const mappedTypeNames = new Set(brandedNumberTypeNameToFunctionName.keys());

  const missing = Array.from(expectedTypeNames)
    .filter((typeName) => !mappedTypeNames.has(typeName))
    .toSorted();

  const stale = Array.from(mappedTypeNames)
    .filter((typeName) => !expectedTypeNames.has(typeName))
    .toSorted();

  const mismatched = collectMismatchedEntries(actualCastFunctions);

  if (missing.length === 0 && stale.length === 0 && mismatched.length === 0) {
    console.info(
      `✓ branded-number-types.mts covers all ${expectedTypeNames.size} ts-data-forge branded-number casts.`,
    );

    return;
  }

  console.error(
    '✗ branded-number-types.mts is out of sync with ts-data-forge:\n',
  );

  if (missing.length > 0) {
    console.error(
      `  Missing ${missing.length} branded number type(s) — add a '<Type>' -> 'as<Type>' entry for:`,
    );

    console.error(`    ${missing.join(', ')}\n`);
  }

  if (stale.length > 0) {
    console.error(
      `  Stale ${stale.length} entry/entries — no matching 'as<Type>' export in ts-data-forge:`,
    );

    console.error(`    ${stale.join(', ')}\n`);
  }

  if (mismatched.length > 0) {
    console.error(`  Mismatched ${mismatched.length} entry/entries:`);

    console.error(`    ${mismatched.join('\n    ')}\n`);
  }

  console.error(
    'Update packages/eslint-plugin-ts-data-forge/src/rules/branded-number-types.mts accordingly.',
  );

  process.exit(1);
};

/**
 * Collects the names of every public `as<Type>` cast function exported by
 * ts-data-forge at runtime.
 */
const collectAsCastFunctionNames = (
  mod: Readonly<Record<string, unknown>>,
): ReadonlySet<string> =>
  new Set(
    Object.keys(mod).filter(
      (key) => AS_CAST_PATTERN.test(key) && typeof mod[key] === 'function',
    ),
  );

/**
 * Flags mapped entries whose function name is not exactly `as<Type>`, or whose
 * function name is not actually exported by ts-data-forge.
 */
const collectMismatchedEntries = (
  actualCastFunctions: ReadonlySet<string>,
): readonly string[] => {
  const mut_mismatched: string[] = [];

  for (const [typeName, functionName] of brandedNumberTypeNameToFunctionName) {
    if (functionName !== `as${typeName}`) {
      mut_mismatched.push(
        `${typeName} -> ${functionName} (expected 'as${typeName}')`,
      );
    } else if (!actualCastFunctions.has(functionName)) {
      mut_mismatched.push(`${functionName} is not exported by ts-data-forge`);
    }
  }

  return mut_mismatched;
};

main();
