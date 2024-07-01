import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-scripts';

export const convertLibEs2019String = (): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    ...(
      [
        //
        'trimLeft(): string;',
        'trimRight(): string;',
      ] as const
    ).map((line) =>
      // comment out deprecated functions
      replaceWithNoMatchCheck(
        //
        line,
        `// ${line}`,
      ),
    ),
  );
