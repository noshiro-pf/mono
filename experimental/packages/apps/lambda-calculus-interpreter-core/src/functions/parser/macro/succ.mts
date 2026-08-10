import { type LambdaTerm } from '../../../types/index.mjs';
import { splitToTokens } from '../split-to-tokens.mjs';

const succStr: string = '(lambda n.(lambda s.(lambda z.(s((n s)z)))))';

export const SUCCtokens: readonly string[] = splitToTokens(succStr);

export const SUCC: LambdaTerm = [
  'lambda',
  'n',
  ['lambda', 's', ['lambda', 'z', ['s', [['n', 's'], 'z']]]],
];
