export const splitToTokens = (input: string): string[] => {
  let spaceInserted = '';
  for (let i = 0; i < input.length; i += 1) {
    const char = input.charAt(i);
    switch (char) {
      case '(':
      case ')':
      case '.':
      case '+':
      case '-':
      case '*':
      case '\\':
        spaceInserted += ' ' + char + ' ';
        break;

      case '\t':
      case '\n':
        spaceInserted += ' ';
        break;

      default:
        spaceInserted += char;
        break;
    }
  }
  return spaceInserted.split(' ').filter((e) => e.length > 0 && e !== ' ');
};
