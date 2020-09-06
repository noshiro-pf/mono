import { splitToTokens } from '../parser/split-to-tokens';

const succStr: string = '(lambda n.(lambda s.(lambda z.(s((n s)z)))))';

export const SUCC: string[] = splitToTokens(succStr);
