import { isArrayOfLength1OrMore } from '@noshiro/ts-utils';
import { ALPHABETS } from '../constants/alphabets';
import { Variable } from '../types/variable';

export const pickUpAvailableVariable = (
  freeVariables: Variable[]
): Variable => {
  const availableVariables = ALPHABETS.filter(
    (e) => !freeVariables.includes(e)
  );
  if (isArrayOfLength1OrMore(availableVariables)) {
    return availableVariables[0]; // pick up one available
  } else {
    throw new Error('alphabets exhausted');
  }
};
