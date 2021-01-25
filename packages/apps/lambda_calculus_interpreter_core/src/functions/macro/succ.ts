import { LambdaTerm } from '../../types/lambda-term';
import { splitToTokens } from '../parser/split-to-tokens';

const succStr: string = '(lambda n.(lambda s.(lambda z.(s((n s)z)))))';

export const SUCCtokens: string[] = splitToTokens(succStr);

export const SUCC: LambdaTerm = [
  'lambda',
  'n',
  ['lambda', 's', ['lambda', 'z', ['s', [['n', 's'], 'z']]]],
];
