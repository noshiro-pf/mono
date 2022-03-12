import { createState } from '@noshiro/syncflow';

export const { state$: myName$, setState: setMyName } = createState<
  string | undefined
>(undefined);
