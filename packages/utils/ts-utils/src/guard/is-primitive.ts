export const isPrimitive = (a: unknown): boolean => {
  switch (typeof a) {
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
