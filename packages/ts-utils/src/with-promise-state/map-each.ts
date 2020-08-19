import { promiseState } from '../types';
import { error, pending, success } from './gen';
import { WPS } from './with-promise-state';

export const mapEach = <P, E, S, PR = P, ER = E, SR = S>(
  mapP: (value: P) => PR,
  mapE: (value: E) => ER,
  mapS: (value: S) => SR
) => (target: WPS<P, E, S>): WPS<PR, ER, SR> => {
  switch (target.status) {
    case promiseState.pending:
      return pending(mapP(target.value));
    case promiseState.error:
      return error(mapE(target.value));
    case promiseState.success:
      return success(mapS(target.value));
  }
};
