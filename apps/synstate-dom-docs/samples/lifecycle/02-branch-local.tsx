import { createBooleanState, createState, map } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';

const [showStats$] = createBooleanState(false);

const [samples$] = createState<readonly number[]>([]);

const Stats = (): JSX.Element => {
  // Created only while the branch is shown, and disposed when it closes.
  const total$ = samples$.pipe(map(Arr.sum));

  return <p>{view(total$, (t) => `Total: ${t}`)}</p>;
};

export const Panel = (): JSX.Element => (
  <If
    cond={showStats$}
    then={<Stats />}
    else={<p>{constant('Stats are hidden')}</p>}
  />
);
