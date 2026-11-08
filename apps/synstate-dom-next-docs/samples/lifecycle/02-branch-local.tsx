import { constant, If, type JSX } from 'synstate-dom-next';
import { createBooleanState, createState, map } from 'synstate-next';
import { Arr } from 'ts-data-forge';

const [showStats$] = createBooleanState(false);

const [samples$] = createState<readonly number[]>([]);

export const Panel = (): JSX.Element => (
  <If
    cond={showStats$}
    then={<Stats />}
    else={<p>{constant('Stats are hidden')}</p>}
  />
);

const Stats = (): JSX.Element => {
  // Created only while the branch is shown, and disposed when it closes.
  const total$ = samples$.pipe(map(Arr.sum));

  return <p>{total$.pipe(map((t) => `Total: ${t}`))}</p>;
};
