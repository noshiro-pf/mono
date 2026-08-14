import { Arr } from 'ts-data-forge';
import { ALPHABETS } from '../constants/index.mjs';
import { type Variable } from '../types/index.mjs';

export const pickUpAvailableVariable = (
  freeVariables: readonly Variable[],
): Variable => {
  const availableVariables = ALPHABETS.filter(
    (e) => !freeVariables.includes(e),
  );

  if (Arr.isNonEmpty(availableVariables)) {
    return availableVariables[0]; // pick up one available
  }

  throw new Error('alphabets exhausted');
};
