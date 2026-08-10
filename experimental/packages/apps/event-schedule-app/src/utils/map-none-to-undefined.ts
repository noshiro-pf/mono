export const mapNoneToUndefined = <T>(value: T | 'none'): T | undefined =>
  value === 'none' ? undefined : value;
