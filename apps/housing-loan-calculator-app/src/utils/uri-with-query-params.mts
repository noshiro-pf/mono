import { withSlash } from 'tiny-router-observable';
import { Arr } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';

export const uriWithQueryParams = (
  uri: string,
  queryParameters: DeepReadonly<
    [string, boolean | number | string | undefined][]
  >,
): string => {
  const nonNullQueryParameters = queryParameters.filter(
    ([_, value]) => value !== undefined,
  );

  const normalizedUri = withSlash(uri);

  if (Arr.isEmpty(nonNullQueryParameters)) {
    return normalizedUri;
  }

  return `${normalizedUri}?${nonNullQueryParameters
    .map(([key, value]) => (value !== undefined ? `${key}=${value}` : ''))
    .join('&')}`;
};
