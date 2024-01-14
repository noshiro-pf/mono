import { Num } from '@noshiro/ts-utils';
import { numberLambdaTerm, PLUStokens, SUCCtokens } from './macro/index.mjs';

export const expandShortcuts = (tokens: readonly string[]): string[] => {
  const mut_expanded: string[] = [];
  for (const token of tokens) {
    const parsedAsNumber = Number.parseInt(token, 10);
    if (!Number.isNaN(parsedAsNumber) && Num.isNonNegative(parsedAsNumber)) {
      /* 3 => (lambda s. (lambda z. (s(s(s z))))) */
      mut_expanded.push(...numberLambdaTerm(parsedAsNumber));
      continue;
    }
    switch (token) {
      case 'SUCC':
        mut_expanded.push(...SUCCtokens);
        break;

      case 'PLUS':
      case '+':
        mut_expanded.push(...PLUStokens);
        break;

      case '\\':
      case 'λ':
        mut_expanded.push('lambda');
        break;

      default:
        mut_expanded.push(token);
        break;
    }
  }
  return mut_expanded;
};
