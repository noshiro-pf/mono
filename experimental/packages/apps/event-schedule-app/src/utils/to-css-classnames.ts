export const toClassName = (flags: Record<string, boolean>): string =>
  Object.entries(flags)
    .filter(([_k, v]) => v)
    .map(([k, _v]) => k)
    .join(' ');
