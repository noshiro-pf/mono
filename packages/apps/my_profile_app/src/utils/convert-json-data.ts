import { Json, JsonValue } from './type';

export const convertJsonData = <T>(
  data: Json | undefined,
  mapFn: (data?: Json) => JsonValue | undefined,
  converter: (v: Json) => T
): T[] => {
  // if (data == null) return [];
  // if (typeof data !== 'object') return [];
  // if (Array.isArray(data)) return [];
  const listElementsOrNull = mapFn(data);
  return listElementsOrNull === undefined || !Array.isArray(listElementsOrNull)
    ? []
    : listElementsOrNull.map(converter);
};
