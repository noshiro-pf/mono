import { Routes } from '../constants';
import { type PlayerWithId } from '../types';
import { router } from './router';

// eslint-disable-next-line @typescript-eslint/no-namespace
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
  > = router.state$.chain(
    mapI(({ searchParams }) => searchParams.get(keyDef.playerId) ?? undefined),
  );

  export const test$: InitializedObservable<boolean> = router.state$.chain(
    mapI(({ searchParams }) => searchParams.get(keyDef.test) !== null),
  );
}
