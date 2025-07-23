import { castMutable } from '@noshiro/ts-utils';

export const dedent = (
  templ: TemplateStringsArray | string,
  // ...values: readonly unknown[]
): string => {
  let mut_strings = castMutable(
    Array.from(typeof templ === 'string' ? [templ] : templ),
  );

  // 1. Remove trailing whitespace.
  mut_strings[mut_strings.length - 1] =
    mut_strings.at(-1)?.replace(/\r?\n([\t ]*)$/u, '') ?? '';

  // 2. Find all line breaks to determine the highest common indentation level.
  const indentLengths = mut_strings.reduce<readonly number[]>((arr, str) => {
    const matches = str.match(/\n([\t ]+|(?!\s).)/gu);
    return matches === null
      ? arr
      : arr.concat(matches.map((match) => match.match(/[\t ]/gu)?.length ?? 0));
  }, []);

  // 3. Remove the common indentation from all strings.
  if (indentLengths.length > 0) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const pattern = new RegExp(`\n[\t ]{${Math.min(...indentLengths)}}`, 'gu');

    mut_strings = castMutable(
      mut_strings.map((str) => str.replace(pattern, '\n')),
    );
  }

  // 4. Remove leading whitespace.
  return mut_strings[0]?.replace(/^\r?\n/u, '') ?? '';
  // mut_strings[0] = mut_strings[0]?.replace(/^\r?\n/u, '') ?? '';

  // 5. Perform interpolation.
  // let string = mut_strings[0];

  // for (const [i, value] of values.entries()) {
  //   // 5.1 Read current indentation level
  //   const endentations = /(?:^|\n)( *)$/u.exec(string);
  //   const endentation = endentations ? endentations[1] : '';
  //   let indentedValue = value;
  //   // 5.2 Add indentation to values with multiline strings
  //   if (typeof value === 'string' && value.includes('\n')) {
  //     indentedValue = value
  //       .split('\n')
  //       .map((str, j) => (j === 0 ? str : `${endentation}${str}`))
  //       .join('\n');
  //   }

  //   string += `${indentedValue}${mut_strings[i + 1]}`;
  // }

  // return mut_strings[0];
};
