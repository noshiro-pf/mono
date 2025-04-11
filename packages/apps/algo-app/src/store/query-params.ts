import { Routes } from '../constants';
import { type PlayerWithId } from '../types';
import { router } from './router';

export namespace QueryParams {
  const keyDef = Routes.queryParamKeys;

  export const setPlayerId = (playerId: PlayerWithId['id']): void => {
    router.updateQueryParams(
      (urlSearchParams) => {
        urlSearchParams.set(keyDef.playerId, playerId);
        return urlSearchParams;
      },
      { method: 'replaceState' },
    );
  };

  export const myPlayerId$: InitializedObservable<
    PlayerWithId['id'] | undefined
  > = router.state.chain(
    map(({ searchParams }) => searchParams.get(keyDef.playerId) ?? undefined),
  );

  export const test$: InitializedObservable<boolean> = router.state.chain(
    map(({ searchParams }) => searchParams.get(keyDef.test) !== null),
  );
}
