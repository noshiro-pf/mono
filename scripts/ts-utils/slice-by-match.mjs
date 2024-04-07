/**
 * @param {Readonly<{
 *   target: string;
 *   startRegexp: string | RegExp;
 *   endRegexp: string | RegExp | undefined;
 * }>} args
 *
 * @returns {string}
 */
export const sliceByMatch = ({ target, startRegexp, endRegexp }) => {
  const start = target.search(startRegexp);

  if (start === -1) {
    throw new Error(`startRegexp "${startRegexp.toString()}" not found.`);
  }

  const slicedTemp = target.slice(start);

  if (endRegexp === undefined) {
    return slicedTemp;
  }

  const end = slicedTemp.search(endRegexp);

  if (end === -1) {
    throw new Error(`endRegexp "${endRegexp.toString()}" not found.`);
  }

  return slicedTemp.slice(0, end);
};
