import type { ObservableId, SubscriberId, Token } from '../types';

function* idMaker(): Generator<number, number, number> {
  let mut_i = 0;
  while (true) {
    yield mut_i;
    mut_i += 1;
  }
}

const observableIdMaker = idMaker();
const subscriberIdMaker = idMaker();
const tokenMaker = idMaker();

export const issueObservableId = (): ObservableId =>
  observableIdMaker.next().value as ObservableId;
export const issueSubscriberId = (): SubscriberId =>
  subscriberIdMaker.next().value as SubscriberId;
export const issueToken = (): Token => tokenMaker.next().value as Token;
