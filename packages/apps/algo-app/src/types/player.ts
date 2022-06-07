export type Player = Readonly<{
  // id: string;
  name: string;
  online: boolean;
}>;

export const isPlayer = (data: unknown): data is Player =>
  isRecord(data) &&
  // IRecord.hasKeyValue(data, 'id', isString) &&
  IRecord.hasKeyValue(data, 'name', isString) &&
  IRecord.hasKeyValue(data, 'online', isBoolean);
