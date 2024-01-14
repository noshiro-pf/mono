import { promiseStatus } from '../types/index.mjs';
import { error, pending, success } from './gen.mjs';
import { type PromiseState } from './promise-result-type.mjs';

export const mapEach =
  <P, E, S, PR = P, ER = E, SR = S>(
    mapP: (value: P) => PR,
    mapE: (value: E) => ER,
    mapS: (value: S) => SR,
  ) =>
  (target: PromiseState<P, E, S>): PromiseState<PR, ER, SR> => {
    switch (target.status) {
      case promiseStatus.pending:
        return pending(mapP(target.value));
      case promiseStatus.error:
        return error(mapE(target.value));
      case promiseStatus.success:
        return success(mapS(target.value));
    }
  };
