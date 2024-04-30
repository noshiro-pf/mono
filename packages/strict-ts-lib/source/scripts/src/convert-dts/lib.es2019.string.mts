import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

export const convertLibEs2019String = (source: string): string =>
  pipe(source).chainMonoTypeFns(
    (['trimLeft(): string;', 'trimRight(): string;'] as const).map((line) =>
      // comment out deprecated functions
      replaceWithNoMatchCheck(
        //
        line,
        `// ${line}`,
      ),
    ),
  ).value;
