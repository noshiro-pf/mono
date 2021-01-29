export type JsonValueType =
  | boolean
  | number
  | string
  | null
  | JsonValueType[]
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  | { [key: string]: JsonValueType };

export type JsonType = Record<string, JsonValueType>;
