import { createState } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';

const [count$] = createState(0);

export const Counter = (): JSX.Element => (
  <p title={constant('A counter')}>
    {constant('Count: ')}
    {count$}
  </p>
);

// @ts-expect-error A plain string is not a Bindable: write constant('Hi').
export const Plain = (): JSX.Element => <p>{'Hi'}</p>;

export const Stale = (): JSX.Element => {
  const count = Optional.unwrap(count$.getSnapshot());

  // @ts-expect-error A snapshot would be written once and never updated.
  return <p>{count}</p>;
};
