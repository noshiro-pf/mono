export type IsFixedLengthList<T extends readonly unknown[]> =
  number extends T['length'] ? false : true;

export type IsNotFixedLengthList<T extends readonly unknown[]> =
  number extends T['length'] ? true : false;
