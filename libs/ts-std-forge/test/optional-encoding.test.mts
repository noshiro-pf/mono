import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  decodeSome,
  encodeSome,
  noneValue,
  reservedPrefix,
} from '../src/functional/optional/impl/encoding.mjs';
import { hasKey, isRecord } from '../src/index.mjs';

/**
 * The encoding of `Optional` and the version of ts-std-forge-keys, held
 * together.
 *
 * The `Optional` types of two copies of ts-std-forge are assignable to each
 * other exactly when both depend on the same version of ts-std-forge-keys, so
 * that version has to change when, and only when, the encoding does (see
 * ts-std-forge-keys' README). `test/optional-encoding-by-keys-major.json`
 * records, under each major of ts-std-forge-keys, the value of `None` and what
 * the encoding writes for each of {@link samples} by name (`(itself)` for a
 * value held as itself). This test holds the encoding to the newest entry,
 * whose major is the version the next release gives ts-std-forge-keys; the
 * entry of a major already given is only added to, never rewritten. This test
 * reads ts-std-forge-keys' version and holds the newest entry's major to it or
 * the one above (while a changeset raises it); which of the two, and that an
 * entry already given is not rewritten, takes the changesets and the base
 * branch, which a guard that reads them is to check.
 *
 * When the encoding changes on purpose, add an entry for the next major with
 * what it writes now (or, while that major is recorded and not yet released,
 * rewrite its entry), a changeset that raises ts-std-forge-keys' major, and one
 * that releases ts-std-forge as a breaking change. A new sample is recorded
 * under a new name in the newest entry.
 */
describe('the encoding of Optional', () => {
  test('is the one recorded under the newest major of ts-std-forge-keys', () => {
    const newest = readTable().at(-1)?.[1];

    assert.isDefined(newest);

    assert.strictEqual(noneValue, newest.none);

    assert.deepStrictEqual(
      Object.fromEntries(
        Object.entries(samples).map(([name, sample]) => {
          const encoded = encodeSome(sample);

          return [name, Object.is(encoded, sample) ? '(itself)' : encoded];
        }),
      ),
      { ...newest.samples },
    );
  });

  test("is recorded under ts-std-forge-keys' major, a major alone, or the one above", () => {
    const newest = readTable().at(-1)?.[0];

    const manifest: unknown = JSON.parse(
      fs.readFileSync(
        path.resolve(
          import.meta.dirname,
          '../../ts-std-forge-keys/package.json',
        ),
        'utf8',
      ),
    );

    assert.isTrue(isRecord(manifest) && hasKey(manifest, 'version'));

    const { version } = manifest;

    assert.isTrue(typeof version === 'string');

    // A major alone: any other version would change every Optional's type
    // without a change of encoding (see ts-std-forge-keys' README).
    assert.match(version, /^[1-9]\d*\.0\.0$/u);

    const keysMajor = Number.parseInt(version.split('.', 1)[0] ?? '', 10);

    assert.include([keysMajor, keysMajor + 1], newest);
  });

  test('differs from one major to the next, which it is the reason for', () => {
    const entries = readTable();

    for (const [index, [, entry]] of entries.entries()) {
      const previous = entries[index - 1]?.[1];

      if (previous === undefined) {
        continue;
      }

      // On what both record: a sample added since says nothing of a change.
      const shared = Object.keys(previous.samples).filter((name) =>
        Object.hasOwn(entry.samples, name),
      );

      assert.isTrue(
        entry.none !== previous.none ||
          shared.some((name) => entry.samples[name] !== previous.samples[name]),
      );
    }
  });

  test.each(Object.entries(samples))(
    'gives %s back from what it writes',
    (_name, sample) => {
      assert.isTrue(Object.is(decodeSome(encodeSome(sample)), sample));
    },
  );
});

/**
 * One value of each kind the encoding treats apart, by the name the table
 * records it under. A sample is added under a new name; a name is never reused.
 */
const samples: ReadonlyRecord<string, unknown> = {
  undefined,
  null: null,
  false: false,
  '0': 0,
  '-0': -0,
  NaN: Number.NaN,
  'empty string': '',
  '0n': 0n,
  none: noneValue,
  'some(none)': `${reservedPrefix}n1`,
  'below the depth limit': `${reservedPrefix}n999999998`,
  'at the depth limit': `${reservedPrefix}n999999999`,
  'over the depth limit': `${reservedPrefix}n1000000000`,
  'prefix, then n': `${reservedPrefix}n`,
  'prefix, then n01': `${reservedPrefix}n01`,
  'prefix, then fu': `${reservedPrefix}fu`,
  'prefix, then f0': `${reservedPrefix}f0`,
  'prefix, then rx': `${reservedPrefix}rx`,
  'prefix, then x': `${reservedPrefix}x`,
  prefix: reservedPrefix,
  'plain string': 'plain',
  '1': 1,
  Infinity: Number.POSITIVE_INFINITY,
  '-Infinity': Number.NEGATIVE_INFINITY,
  '1n': 1n,
  true: true,
  object: { id: 1 },
  symbol: Symbol('sample'),
  function: () => 1,
} as const;

/** What the encoding writes under one major. */
type Entry = Readonly<{
  none: string;
  samples: ReadonlyRecord<string, string>;
}>;

const isEntry = (u: unknown): u is Entry =>
  isRecord(u) &&
  hasKey(u, 'none') &&
  typeof u.none === 'string' &&
  hasKey(u, 'samples') &&
  isRecord(u.samples) &&
  Object.values(u.samples).every((encoded) => typeof encoded === 'string');

/** The table's entries by major, oldest first. */
const readTable = (): readonly (readonly [number, Entry])[] => {
  const parsed: unknown = JSON.parse(
    fs.readFileSync(
      path.resolve(
        import.meta.dirname,
        './optional-encoding-by-keys-major.json',
      ),
      'utf8',
    ),
  );

  assert.isTrue(isRecord(parsed));

  return Object.entries(parsed)
    .map(([key, entry]) => {
      // A major alone (`"1"`, not `"01"`), so that the newest entry is plain.
      assert.match(key, /^[1-9]\d*$/u);

      assert.isTrue(isEntry(entry));

      return [Number.parseInt(key, 10), entry] as const;
    })
    .toSorted(([a], [b]) => a - b);
};
