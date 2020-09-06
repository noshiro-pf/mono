import { splitToTokens } from '../parser/split-to-tokens';

const plusStr: string =
  '(lambda m.(lambda n.(lambda s.(lambda z.((m s) ((n s)z))))))';

export const PLUS: string[] = splitToTokens(plusStr);
