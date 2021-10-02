import { withSlash } from '@noshiro/tiny-router-react-hooks';
import { isNotUndefined } from '@noshiro/ts-utils';

export const uriWithQueryParams = (
  uri: string,
  queryParameters: DeepReadonly<
    [string, boolean | number | string | undefined][]
  >
): string => {
  const nonNullQueryParameters = queryParameters.filter(
    ([_, value]) => value !== undefined
  );

  const normalizedUri = withSlash(uri);

  if (nonNullQueryParameters.length === 0) {
    return normalizedUri;
  }
  return `${normalizedUri}?${nonNullQueryParameters
    .map(([key, value]) => (isNotUndefined(value) ? `${key}=${value}` : ''))
    .join('&')}`;
};
