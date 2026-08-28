import { isSafeUint, Num, Result } from 'ts-data-forge';
import { numberLambdaTerm, PLUStokens, SUCCtokens } from './macro/index.mjs';

export const expandShortcuts = (
  tokens: readonly string[],
): readonly string[] => {
  const mut_expanded: string[] = [];

  for (const token of tokens) {
    const parsedAsNumber = Result.unwrapOkOr(
      Num.safeParseInt(token),
      Number.NaN,
    );

    /* 3 => (lambda s. (lambda z. (s(s(s z))))) */
    mut_expanded.push(
      ...(isSafeUint(parsedAsNumber)
        ? numberLambdaTerm(parsedAsNumber)
        : expandToken(token)),
    );
  }

  return mut_expanded;
};

const expandToken = (token: string): readonly string[] => {
  switch (token) {
    case 'SUCC':
      return SUCCtokens;

    case 'PLUS':
    case '+':
      return PLUStokens;

    case '\\':
    case 'λ':
      return ['lambda'];

    default:
      return [token];
  }
};
