import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import type { MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';

export const convertLibEs5_NumberConstructor: MonoTypeFunction<string> = (
  src,
) =>
  pipe(src).map(
    composeMonoTypeFns(
      replaceWithinInterface({
        name: 'NumberConstructor',
        mapFn: composeMonoTypeFns(
          ...[
            //
            'new (value?: unknown): Number;',
          ].map((line) =>
            replaceWithNoMatchCheck(
              line,
              dedent`
                  /** @deprecated Don't use Number constructor */
                ${line}
              `,
            ),
          ),
        ),
      }),
    ),
  ).value;
