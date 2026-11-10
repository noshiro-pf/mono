import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { source } from 'synstate';
import {
  createReducer,
  createState,
  useObservableValue,
} from '../src/index.mjs';

describe('server rendering', () => {
  test('useObservableValue renders the current value', () => {
    const count$ = source<number>(3);

    const Count = (): React.ReactNode => {
      const count = useObservableValue(count$);

      return React.createElement('span', undefined, count);
    };

    assert.strictEqual(
      renderToString(React.createElement(Count)),
      '<span>3</span>',
    );
  });

  test('useObservableValue renders the given value for an observable without one', () => {
    const count$ = source<number>();

    const Count = (): React.ReactNode => {
      const count = useObservableValue(count$, -1);

      return React.createElement('span', undefined, count);
    };

    assert.strictEqual(
      renderToString(React.createElement(Count)),
      '<span>-1</span>',
    );
  });

  test("createState's useCurrentValue renders the current value", () => {
    const [useCurrentValue] = createState('ready');

    const Status = (): React.ReactNode => {
      const status = useCurrentValue();

      return React.createElement('span', undefined, status);
    };

    assert.strictEqual(
      renderToString(React.createElement(Status)),
      '<span>ready</span>',
    );
  });

  test("createReducer's useCurrentValue renders the current value", () => {
    const [useCurrentValue] = createReducer(
      (state: number, action: number) => state + action,
      10,
    );

    const Count = (): React.ReactNode => {
      const count = useCurrentValue();

      return React.createElement('span', undefined, count);
    };

    assert.strictEqual(
      renderToString(React.createElement(Count)),
      '<span>10</span>',
    );
  });
});
