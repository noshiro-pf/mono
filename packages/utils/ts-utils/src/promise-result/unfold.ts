import { PromiseState } from './promise-result-type';

export const unfold = <S, P = undefined, E = any>(
  result: PromiseState<P, E, S>
): S | undefined => {
  switch (result.status) {
    case 'success':
      return result.value;
    default:
      return undefined;
  }
};
