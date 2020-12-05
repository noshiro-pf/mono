import { promiseState } from '../types';
import { error, pending, success } from './gen';
import { PromiseResult } from './promise-result-type';

export const mapEach = <P, E, S, PR = P, ER = E, SR = S>(
  mapP: (value: P) => PR,
  mapE: (value: E) => ER,
  mapS: (value: S) => SR
) => (target: PromiseResult<P, E, S>): PromiseResult<PR, ER, SR> => {
  switch (target.status) {
    case promiseState.pending:
      return pending(mapP(target.value));
    case promiseState.error:
      return error(mapE(target.value));
    case promiseState.success:
      return success(mapS(target.value));
  }
};
