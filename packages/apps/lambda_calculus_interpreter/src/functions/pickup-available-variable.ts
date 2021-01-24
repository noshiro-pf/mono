import { ALPHABETS } from '../constants/alphabets';
import { Variable } from '../types/variable';

export const pickUpAvailableVariable = (
  freeVariables: Variable[]
): Variable => {
  const availableVariables = ALPHABETS.filter(
    (e) => !freeVariables.includes(e)
  );
  if (availableVariables.length < 1) console.error('alphabets exhausted');
  return availableVariables[0] as Variable; // pick up one available
};
