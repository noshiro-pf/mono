import type { ObservableId, SubscriberId, Token } from '../types';

function* idMaker<T extends number>(): Generator<T, T, T> {
  let mut_i: T = 0 as T;
  while (true) {
    yield mut_i;
    mut_i = (mut_i + 1) as T;
  }
}

const observableIdMaker = idMaker<ObservableId>();
const subscriberIdMaker = idMaker<SubscriberId>();
const tokenMaker = idMaker<Token>();

export const issueObservableId = (): ObservableId =>
  observableIdMaker.next().value;

export const issueSubscriberId = (): SubscriberId =>
  subscriberIdMaker.next().value;

export const issueToken = (): Token => tokenMaker.next().value;
