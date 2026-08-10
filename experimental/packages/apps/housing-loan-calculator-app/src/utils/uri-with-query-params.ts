import { Router } from '../router';

export const uriWithQueryParams = (
  uri: string,
  queryParameters: DeepReadonly<
    [string, boolean | number | string | undefined][]
  >,
): string => {
  const nonNullQueryParameters = queryParameters.filter(
    ([_, value]) => value !== undefined,
  );

  const normalizedUri = Router.utils.withSlash(uri);

  if (nonNullQueryParameters.length === 0) {
    return normalizedUri;
  }
  return `${normalizedUri}?${nonNullQueryParameters
    .map(([key, value]) => (isNotUndefined(value) ? `${key}=${value}` : ''))
    .join('&')}`;
};
