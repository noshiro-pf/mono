import { numberLambdaTerm, PLUStokens, SUCCtokens } from './macro';

export const expandShortcuts = (tokens: readonly string[]): string[] => {
  const expanded: string[] = [];
  tokens.forEach((token) => {
    const parsedAsNumber = parseInt(token, 10);
    if (!isNaN(parsedAsNumber)) {
      /* 3 => (lambda s. (lambda z. (s(s(s z))))) */
      expanded.push(...numberLambdaTerm(parsedAsNumber));
      return;
    }
    switch (token) {
      case 'SUCC':
        expanded.push(...SUCCtokens);
        break;
      case 'PLUS':
      case '+':
        expanded.push(...PLUStokens);
        break;
      case '\\':
      case 'λ':
        expanded.push('lambda');
        break;
      default:
        expanded.push(token);
        break;
    }
  });
  return expanded;
};
