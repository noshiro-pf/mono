export const toUnionString = (members: readonly string[]): string =>
  members.map((k) => `"${k}"`).join(' | ');

export const toIntersectionString = (members: readonly string[]): string =>
  members.map((k) => `"${k}"`).join(' & ');
