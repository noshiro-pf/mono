import { SafeUint, toSafeUint } from '@noshiro/ts-utils';
import { dedent } from './dedent.mjs';

/**
 * Extracts the removed substrings from a full text compared to a text with some substring missing.
 * Assume that the fullText includes all substrings in textWithSomeSubstringMissing.
 */
export const extractRemovedSubStrings = (
  fullText: string,
  textWithSomeSubstringMissing: string,
): readonly Readonly<{
  range: readonly [number, number];
  text: string;
}>[] => {
  const mut_result: Readonly<{
    range: readonly [number, number];
    text: string;
  }>[] = [];

  let mut_ptrFull: SafeUint = toSafeUint(0);
  let mut_ptrMissing: SafeUint = toSafeUint(0);

  while (
    mut_ptrFull < fullText.length &&
    mut_ptrMissing < textWithSomeSubstringMissing.length
  ) {
    if (
      fullText[mut_ptrFull] === textWithSomeSubstringMissing[mut_ptrMissing]
    ) {
      // Characters match, advance both pointers
      mut_ptrFull = SafeUint.add(1, mut_ptrFull);
      mut_ptrMissing = SafeUint.add(1, mut_ptrMissing);
    } else {
      // Mismatch found, start of a removed section in fullText
      const start = mut_ptrFull;
      // Advance ptrFull until a match is found or end of fullText
      while (
        mut_ptrFull < fullText.length &&
        (mut_ptrMissing >= textWithSomeSubstringMissing.length || // Handle case where missing text ends first
          fullText[mut_ptrFull] !==
            textWithSomeSubstringMissing[mut_ptrMissing])
      ) {
        mut_ptrFull = SafeUint.add(1, mut_ptrFull);
      }
      // Record the removed substring
      const end = mut_ptrFull;
      if (start < end) {
        mut_result.push({
          range: [start, end],
          text: fullText.slice(start, end),
        });
      }
      // If a match was found (i.e., ptrFull didn't just reach the end), advance both pointers
      if (
        mut_ptrFull < fullText.length &&
        mut_ptrMissing < textWithSomeSubstringMissing.length
      ) {
        mut_ptrFull = SafeUint.add(1, mut_ptrFull);
        mut_ptrMissing = SafeUint.add(1, mut_ptrMissing);
      }
    }
  }

  // If there's remaining text in fullText, it was all removed from the end
  if (mut_ptrFull < fullText.length) {
    mut_result.push({
      range: [mut_ptrFull, fullText.length],
      text: fullText.slice(mut_ptrFull),
    });
  }

  return mut_result;
};

if (import.meta.vitest !== undefined) {
  describe('extractRemovedSubStrings', () => {
    test.each([
      {
        fullText: 'aaabbbccc',
        textWithSomeSubstringMissing: 'aaaccc',
        expected: [
          {
            range: [3, 6],
            text: 'bbb',
          },
        ],
        description: 'Removal in the middle',
      },
      {
        fullText: 'Hello, this is a test string.',
        textWithSomeSubstringMissing: 'Hello, this is a test string.',
        expected: [],
        description: 'No removal',
      },
      {
        fullText: 'aaabbbccc',
        textWithSomeSubstringMissing: 'bbbccc',
        expected: [
          {
            range: [0, 3],
            text: 'aaa',
          },
        ],
        description: 'Removal at the beginning',
      },
      {
        fullText: 'aaabbbccc',
        textWithSomeSubstringMissing: 'aaabbb',
        expected: [
          {
            range: [6, 9],
            text: 'ccc',
          },
        ],
        description: 'Removal at the end',
      },
      {
        fullText: 'axbyczd',
        textWithSomeSubstringMissing: 'abcd',
        expected: [
          { range: [1, 2], text: 'x' },
          { range: [3, 4], text: 'y' },
          { range: [5, 6], text: 'z' },
        ],
        description: 'Multiple single-character removals',
      },
      {
        fullText: 'abc123def456ghi',
        textWithSomeSubstringMissing: 'abcdefghi',
        expected: [
          { range: [3, 6], text: '123' },
          { range: [9, 12], text: '456' },
        ],
        description: 'Multiple multi-character removals',
      },
      {
        fullText: 'abc',
        textWithSomeSubstringMissing: '',
        expected: [{ range: [0, 3], text: 'abc' }],
        description: 'Removal resulting in empty string',
      },
      {
        fullText: '',
        textWithSomeSubstringMissing: '',
        expected: [],
        description: 'Both strings empty',
      },
      {
        fullText: '',
        textWithSomeSubstringMissing: 'abc',
        expected: [], // Cannot remove from empty string
        description: 'Full text empty',
      },
      {
        fullText: 'aaaa',
        textWithSomeSubstringMissing: 'aa',
        expected: [{ range: [2, 4], text: 'aa' }],
        description: 'Removal of repeating characters',
      },
      {
        fullText: dedent`
          This is the first line.
          Some text removed here.
          This is the third line.

          More text removed.
          And this is the final line.
        `,
        textWithSomeSubstringMissing: dedent`
          This is the first line.
          This is the third line.

          And this is the final line.
        `,
        expected: [
          { range: [24, 48], text: 'Some text removed here.\n' },
          { range: [73, 92], text: 'More text removed.\n' },
        ],
        description:
          'Longer string with newlines, spaces, and multiple removals',
      },
    ] as const satisfies {
      fullText: string;
      textWithSomeSubstringMissing: string;
      expected: readonly Readonly<{
        range: readonly [number, number];
        text: string;
      }>[];
      description: string;
    }[])(
      '$description',
      ({ expected, fullText, textWithSomeSubstringMissing }) => {
        const result = extractRemovedSubStrings(
          fullText,
          textWithSomeSubstringMissing,
        );

        expect(result).toStrictEqual(expected);
      },
    );
  });
}
