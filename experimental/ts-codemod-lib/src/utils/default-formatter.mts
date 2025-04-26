import * as prettier from 'prettier';

export const defaultFormatter = (code: string): Promise<string> =>
  prettier.format(code, {
    parser: 'typescript',
  });
