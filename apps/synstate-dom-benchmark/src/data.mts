/** One row of the table every implementation renders. */
export type RowData = Readonly<{ id: number; label: string }>;

const adjectives = [
  'pretty',
  'large',
  'big',
  'small',
  'tall',
  'short',
  'long',
  'handsome',
  'plain',
  'quaint',
  'clean',
  'elegant',
  'easy',
  'angry',
  'crazy',
  'helpful',
  'mushy',
  'odd',
  'unsightly',
  'adorable',
  'important',
  'inexpensive',
  'cheap',
  'expensive',
  'fancy',
] as const;

const colours = [
  'red',
  'yellow',
  'blue',
  'green',
  'pink',
  'brown',
  'purple',
  'brown',
  'white',
  'black',
  'orange',
] as const;

const nouns = [
  'table',
  'chair',
  'house',
  'bbq',
  'desk',
  'car',
  'pony',
  'cookie',
  'sandwich',
  'burger',
  'pizza',
  'mouse',
  'keyboard',
] as const;

/**
 * Builds rows the way js-framework-benchmark does: ids keep counting up across
 * calls, labels are three random words. The generator is seeded, so every
 * implementation is given the same labels.
 */
export const createRowFactory = (): Readonly<{
  build: (count: number) => readonly RowData[];
}> => {
  const mut_state = { nextId: 1, seed: 1 };

  const random = (max: number): number => {
    // xorshift32: deterministic and cheap enough not to show in the timings.
    let mut_x = mut_state.seed;

    mut_x ^= mut_x << 13;

    mut_x ^= mut_x >>> 17;

    mut_x ^= mut_x << 5;

    mut_state.seed = mut_x >>> 0;

    return mut_state.seed % max;
  };

  const pick = <T,>(words: readonly T[]): T => {
    const word = words[random(words.length)];

    if (word === undefined) {
      throw new Error('unreachable');
    }

    return word;
  };

  return {
    build: (count) =>
      Array.from({ length: count }, () => {
        const id = mut_state.nextId;

        mut_state.nextId += 1;

        return {
          id,
          label: `${pick(adjectives)} ${pick(colours)} ${pick(nouns)}`,
        };
      }),
  };
};

/** Swaps the second and the second-to-last element, as `swapRows` does. */
export const swapSecondAndSecondToLast = <T,>(
  rows: readonly T[],
): readonly T[] => {
  if (rows.length < 4) {
    return rows;
  }

  const a = rows[1];

  const b = rows.at(-2);

  return a === undefined || b === undefined
    ? rows
    : rows.with(1, b).with(rows.length - 2, a);
};
