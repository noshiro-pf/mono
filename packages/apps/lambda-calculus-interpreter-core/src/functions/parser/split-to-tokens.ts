import { range } from '@noshiro/ts-utils';

export const splitToTokens = (input: string): readonly string[] => {
  let mut_spaceInserted = '';
  for (const i of range(0, input.length)) {
    const char = input.charAt(i);
    switch (char) {
      case '(':
      case ')':
      case '.':
      case '+':
      case '-':
      case '*':
      case '\\':
        mut_spaceInserted += ` ${char} `;
        break;

      case '\t':
      case '\n':
        mut_spaceInserted += ' ';
        break;

      default:
        mut_spaceInserted += char;
        break;
    }
  }
  return mut_spaceInserted.split(' ').filter((e) => e.length > 0 && e !== ' ');
};
