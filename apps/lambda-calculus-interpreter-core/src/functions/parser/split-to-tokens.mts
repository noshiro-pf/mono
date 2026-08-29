export const splitToTokens = (input: string): readonly string[] => {
  let mut_spaceInserted = '';

  for (const char of input) {
    mut_spaceInserted += separate(char);
  }

  return mut_spaceInserted.split(' ').filter((e) => e.length > 0 && e !== ' ');
};

/** Surrounds the characters that are tokens on their own with spaces. */
const separate = (char: string): string => {
  switch (char) {
    case '(':
    case ')':
    case '.':
    case '+':
    case '-':
    case '*':
    case '\\':
      return ` ${char} `;

    case '\t':
    case '\n':
      return ' ';

    default:
      return char;
  }
};
