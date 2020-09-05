import { JsonType, JsonValueType } from '@mono/ts-utils';

export const convertJsonData = <T>(
  data: JsonType | undefined,
  mapFn: (data?: JsonType) => JsonValueType | undefined,
  converter: (v: JsonType) => T
): T[] => {
  const listElementsOrNull = mapFn(data);
  if (listElementsOrNull === undefined || !Array.isArray(listElementsOrNull))
    return [];
  if (listElementsOrNull.some((e) => e === null || typeof e !== 'object'))
    return [];
  return (listElementsOrNull as JsonType[]).map(converter);
};
