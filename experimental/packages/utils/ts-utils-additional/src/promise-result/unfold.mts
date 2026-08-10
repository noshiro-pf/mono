import { type PromiseState } from './promise-result-type.mjs';

export const unfold = <S, P = undefined, E = unknown>(
  result: PromiseState<P, E, S>,
): S | undefined => {
  switch (result.status) {
    case 'success':
      return result.value;
    case 'error':
    case 'pending':
      return undefined;
  }
};
