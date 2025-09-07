export const toUnionString = (members: readonly string[]): string =>
  members.map((k) => `"${k}"`).join(' | ');
