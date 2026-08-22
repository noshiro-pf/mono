type KeyValueRecordFromKeys<Keys extends readonly string[]> = Readonly<{
  [K in Keys[number]]: K;
}>;

export const generateKeyValueRecordFromKeys = <Keys extends readonly string[]>(
  keys: Keys,
): KeyValueRecordFromKeys<Keys> =>
  Object.fromEntries(
    keys.map((k) => [k, k] as const),
  ) as KeyValueRecordFromKeys<Keys>;
