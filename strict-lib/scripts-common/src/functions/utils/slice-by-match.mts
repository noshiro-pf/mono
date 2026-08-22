/**
 * Get the substring of target between the start and end positions that match
 * the regular expression.
 */
export const sliceByMatch = ({
  target,
  startRegexp,
  endRegexp,
}: Readonly<{
  target: string;
  startRegexp: RegExp | string;
  endRegexp: RegExp | string | undefined;
}>): string => {
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
