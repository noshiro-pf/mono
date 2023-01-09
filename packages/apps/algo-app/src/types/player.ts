export type Player = Readonly<{
  // id: string;
  name: string;
  online: boolean;
}>;

export const isPlayer = (data: unknown): data is Player =>
  isRecord(data) &&
  // Obj.hasKeyValue(data, 'id', isString) &&
  Obj.hasKeyValue(data, 'name', isString) &&
  Obj.hasKeyValue(data, 'online', isBoolean);
