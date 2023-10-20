import { createState } from '@noshiro/syncflow';
import { useObservableValue } from '@noshiro/syncflow-react-hooks';

const { state$: count$, updateState: updateCount } = createState(0);

const incrementCount = (): void => {
  updateCount((i) => i + 1);
};

export function CounterComponent(): JSX.Element {
  const count = useObservableValue(count$);

  return (
    <div>
      <div>{count}</div>
      <button type='button' onClick={incrementCount}>
        {'+1'}
      </button>
    </div>
  );
}
