export type PrimitiveType =
  | bigint
  | boolean
  | number
  | string
  | symbol
  | null
  | undefined;

export const isPrimitive = (value: unknown): boolean => {
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
    case 'symbol':
    case 'bigint':
      return true;
    default:
      return false;
  }
};
