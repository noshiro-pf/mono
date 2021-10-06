import { mapI } from '@noshiro/syncflow';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { createRouter } from '@noshiro/tiny-router-observable';
import { getEventIdFromPathname, isRoute } from '../constants';

const _router = createRouter();

const pathname$ = _router.pathname$;
const pathnameTokens$ = pathname$.chain(
  mapI((str) => str.split('/').filter((s) => s !== ''))
);

export const router = {
  ..._router,
  pathnameTokens$,

  isRoute: {
    createPage$: pathnameTokens$.chain(mapI(isRoute.createPage)),
    answerPage$: pathnameTokens$.chain(mapI(isRoute.answerPage)),
    editPage$: pathnameTokens$.chain(mapI(isRoute.editPage)),
  },
  eventId$: pathnameTokens$.chain(mapI(getEventIdFromPathname)),
} as const;

export const useShowPage = (): Readonly<{
  createPage: boolean;
  answerPage: boolean;
  editPage: boolean;
}> => {
  const createPage = useStreamValue(router.isRoute.createPage$);
  const answerPage = useStreamValue(router.isRoute.answerPage$);
  const editPage = useStreamValue(router.isRoute.editPage$);

  return {
    createPage,
    answerPage,
    editPage,
  };
};
