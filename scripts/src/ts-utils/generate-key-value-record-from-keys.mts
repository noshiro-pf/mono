type KeyValueRecordFromKeys<Keys extends readonly string[]> = Readonly<{
  [K in Keys[number]]: K;
}>;

export const generateKeyValueRecordFromKeys = <Keys extends readonly string[]>(
  keys: Keys,
): KeyValueRecordFromKeys<Keys> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Object.fromEntries(
    keys.map((k) => [k, k] as const),
  ) as unknown as KeyValueRecordFromKeys<Keys>;
