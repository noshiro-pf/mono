import {
  type ObservableId,
  type SubscriberId,
  type UpdateToken,
} from '../types/index.mjs';

function* idMaker<T extends symbol>(): Generator<T, T, T> {
  let mut_i = 0;

  while (true) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    yield Symbol(mut_i.toString()) as T;

    mut_i += 1;
  }
}

const observableIdMaker = idMaker<ObservableId>();

const subscriberIdMaker = idMaker<SubscriberId>();

const updateTokenMaker = idMaker<UpdateToken>();

export const issueObservableId = (): ObservableId =>
  observableIdMaker.next().value;

export const issueSubscriberId = (): SubscriberId =>
  subscriberIdMaker.next().value;

export const issueUpdateToken = (): UpdateToken =>
  updateTokenMaker.next().value;
