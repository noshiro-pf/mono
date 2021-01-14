import { numberLambdaTerm } from '../macro/number';
import { PLUStokens } from '../macro/plus';
import { SUCCtokens } from '../macro/succ';

export const expandShortcuts = (tokens: string[]): string[] => {
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
        expanded.push('lambda');
        break;
      default:
        expanded.push(token);
        break;
    }
  });
  return expanded;
};
