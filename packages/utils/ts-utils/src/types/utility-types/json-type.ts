export type JsonValueType =
  | JsonValueType[]
  | boolean
  | number
  | string
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  | { [key: string]: JsonValueType }
  | null;

export type JsonType = Record<string, JsonValueType>;
