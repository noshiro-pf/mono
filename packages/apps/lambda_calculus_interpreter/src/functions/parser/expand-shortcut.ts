import { LAMBDA } from '../../constants/lambda';
import { numberLambdaTerm } from '../macro/number';
import { PLUS } from '../macro/plus';
import { SUCC } from '../macro/succ';

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
        expanded.push(...SUCC);
        break;
      case 'PLUS':
      case '+':
        expanded.push(...PLUS);
        break;
      case '\\':
        expanded.push(LAMBDA);
        break;
      default:
        expanded.push(token);
        break;
    }
  });
  return expanded;
};
