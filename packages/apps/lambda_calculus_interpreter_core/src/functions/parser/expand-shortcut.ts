import { numberLambdaTerm, PLUStokens, SUCCtokens } from './macro';

export const expandShortcuts = (tokens: readonly string[]): string[] => {
  const mut_expanded: string[] = [];
  tokens.forEach((token) => {
    const parsedAsNumber = parseInt(token, 10);
    if (!isNaN(parsedAsNumber)) {
      /* 3 => (lambda s. (lambda z. (s(s(s z))))) */
      mut_expanded.push(...numberLambdaTerm(parsedAsNumber));
      return;
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
  });
  return mut_expanded;
};
