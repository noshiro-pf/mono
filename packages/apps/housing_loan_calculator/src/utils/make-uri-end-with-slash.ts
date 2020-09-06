export const makeUriEndWithSlash = (uri: string): string =>
  uri + (uri.endsWith('/') ? '' : '/');
