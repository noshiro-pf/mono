export type JsonValueType =
  | boolean
  | number
  | string
  | readonly JsonValueType[]
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  | { readonly [key: string]: JsonValueType }
  | null;

export type JsonType = Readonly<Record<string, JsonValueType>>;
