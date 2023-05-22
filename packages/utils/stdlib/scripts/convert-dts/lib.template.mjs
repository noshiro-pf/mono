/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertTemplate = (from) => {
  let ret = from;

  // ret = ret.replaceAll(
  //   'includes(searchElement: T, fromIndex?: number): boolean;',
  //   'includes(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: number): searchElement is T;'
  // );

  return ret;
};
