import type { LambdaTerm } from '../../../types';
import { splitToTokens } from '../split-to-tokens';

const plusStr: string =
  '(lambda m.(lambda n.(lambda s.(lambda z.((m s) ((n s)z))))))';

export const PLUStokens: readonly string[] = splitToTokens(plusStr);

export const PLUS: LambdaTerm = [
  'lambda',
  'm',
  [
    'lambda',
    'n',
    [
      'lambda',
      's',
      [
        'lambda',
        'z',
        [
          ['m', 's'],
          [['n', 's'], 'z'],
        ],
      ],
    ],
  ],
];
