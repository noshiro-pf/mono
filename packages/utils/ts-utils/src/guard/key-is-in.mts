/** 内部的には `Object.hasOwn` と同じ動作だが、 object ではなく key についての型ガード関数になっている。 */
export const keyIsIn = <K extends PropertyKey, R extends UnknownRecord>(
  key: K,
  obj: R,
): key is K & keyof typeof obj => Object.hasOwn(obj, key);
