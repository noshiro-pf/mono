import { Arr } from 'ts-data-forge';

/**
 * The package a bare import specifier names, or `undefined` for any other: a
 * path, a `#` subpath import, or a URL or a `node:` builtin (a scheme).
 */
export const packageNameOf = (specifier: string): string | undefined => {
  if (/^[./#]/u.test(specifier) || /^[a-z][\w+.-]*:/iu.test(specifier)) {
    return undefined;
  }

  const segments = specifier.split('/');

  return specifier.startsWith('@')
    ? Arr.take(segments, 2).join('/')
    : segments[0];
};
