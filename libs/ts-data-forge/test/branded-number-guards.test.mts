import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
// eslint-disable-next-line import-x/no-internal-modules -- the modules were generated from this config, and `scripts/` has no barrel
import { brandedNumberConfigs } from '../scripts/gen-branded-number/config.mjs';

// `gen:branded-number` writes each branded number's `is<T>` out in its module
// and leaves every other operator to the `operatorsFor*` factory in
// `src/number/operators/`, whose own `is` those operators check against. The
// two definitions of the domain must agree.
describe('the written-out is<T> agrees with the factory', () => {
  const numberDir = path.resolve(import.meta.dirname, '../src/number');

  const samples = [
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    -0,
    0,
    0.5,
    -0.5,
    Number.MIN_VALUE,
    -Number.MIN_VALUE,
    Number.MAX_VALUE,
    -Number.MAX_VALUE,
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER + 1,
    Number.MIN_SAFE_INTEGER - 1,
    ...[1, 127, 128, 255, 256, 2 ** 15, 2 ** 16, 2 ** 31, 2 ** 32].flatMap(
      (n) => [n - 1, n, n + 1, -n - 1, -n, -n + 1],
    ),
  ] as const;

  test('every operators module belongs to a configured type', async () => {
    const operatorFiles = await fs.readdir(
      path.resolve(numberDir, 'operators'),
    );

    assert.deepStrictEqual(
      operatorFiles.toSorted(),
      brandedNumberConfigs
        .map((config) => `${config.kebabName}.mts`)
        .toSorted(),
    );
  });

  test.each(brandedNumberConfigs)('$pascalName', async (config) => {
    const operators = await importModule(
      path.resolve(numberDir, 'operators', `${config.kebabName}.mts`),
    );

    const branded = await importModule(
      path.resolve(numberDir, config.dir, `${config.kebabName}.mts`),
    );

    const factoryGuard = operators.get('is');

    const guardName = `is${config.pascalName}` as const;

    const guard = branded.get(guardName);

    assert.isTrue(isGuard(factoryGuard) && isGuard(guard));

    if (!isGuard(factoryGuard) || !isGuard(guard)) {
      return;
    }

    const values = [
      ...samples,
      operators.get('MIN_VALUE'),
      operators.get('MAX_VALUE'),
    ] as const;

    for (const value of values) {
      if (typeof value === 'number') {
        expect(guard(value), `${guardName}(${value})`).toBe(
          factoryGuard(value),
        );
      }
    }
  });
});

const isRecord = (u: unknown): u is ReadonlyRecord<string, unknown> =>
  typeof u === 'object' && u !== null;

const importModule = async (
  filePath: string,
): Promise<ReadonlyMap<string, unknown>> => {
  const namespace: unknown = await import(filePath);

  assert.isTrue(isRecord(namespace));

  return new Map<string, unknown>(
    isRecord(namespace) ? Object.entries(namespace) : [],
  );
};

const isGuard = (u: unknown): u is (value: number) => boolean =>
  typeof u === 'function';
