import type { DeepReadonly } from '@noshiro/ts-utils';
import { isNotUndefined } from '@noshiro/ts-utils';
import { makeUriEndWithSlash } from './make-uri-end-with-slash';

export const uriWithQueryParams = (
  uri: string,
  queryParameters: DeepReadonly<
    [string, boolean | number | string | undefined][]
  >
): string => {
  const nonNullQueryParameters = queryParameters.filter(
    ([_, value]) => value !== undefined
  );

  const normalizedUri = makeUriEndWithSlash(uri);

  if (nonNullQueryParameters.length === 0) {
    return normalizedUri;
  }
  return `${normalizedUri}?${nonNullQueryParameters
    .map(([key, value]) => (isNotUndefined(value) ? `${key}=${value}` : ''))
    .join('&')}`;
};
