export type JsonValueType =
  | boolean
  | number
  | string
  | null
  | JsonValueType[]
  | { [key: string]: JsonValueType };

export type JsonType = { [key: string]: JsonValueType };
