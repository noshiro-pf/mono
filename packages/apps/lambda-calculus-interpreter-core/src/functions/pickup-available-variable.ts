import { ALPHABETS } from '../constants';
import type { Variable } from '../types';

export const pickUpAvailableVariable = (
  freeVariables: readonly Variable[]
): Variable => {
  const availableVariables = ALPHABETS.filter(
    (e) => !freeVariables.includes(e)
  );
  if (Arr.isArrayOfLength1OrMore(availableVariables)) {
    return availableVariables[0]; // pick up one available
  } else {
    throw new Error('alphabets exhausted');
  }
};
