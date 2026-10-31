/** @jsxImportSource react */
import { memo, useState, type JSX } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { Framework } from '../bench-app.mjs';
import {
  createTableOperations,
  emptyTable,
  type TableState,
} from '../table-state.mjs';

/**
 * React as js-framework-benchmark's keyed hooks implementation writes it: the
 * table is one state, re-rendered with keys, and each row is a `memo` component
 * that re-renders only when its label or its selection changes.
 *
 * An operation here is a plain call rather than a click, which React would
 * schedule as a default update; `flushSync` renders it at once, as a click
 * handler's update is.
 */
export const react: Framework = {
  name: 'React',
  mount: (container) => {
    const root = createRoot(container);

    const mut_view: { setState: ((state: TableState) => void) | undefined } = {
      setState: undefined,
    };

    const App = (): JSX.Element => {
      const [state, setState] = useState(emptyTable);

      // The setter is stable; the operations below call it from outside.
      mut_view.setState = setState;

      return (
        <table>
          <tbody>
            {state.rows.map((row) => (
              <Row
                key={row.id}
                id={row.id}
                label={row.label}
                selected={row.id === state.selected}
              />
            ))}
          </tbody>
        </table>
      );
    };

    flushSync(() => {
      root.render(<App />);
    });

    return createTableOperations(
      (state) => {
        flushSync(() => {
          mut_view.setState?.(state);
        });
      },
      () => {
        root.unmount();
      },
    );
  },
} as const;

type RowProps = Readonly<{
  id: number;
  label: string;
  selected: boolean;
}>;

const Row = memo(({ id, label, selected }: RowProps): JSX.Element => (
  <tr className={selected ? 'danger' : ''}>
    <td>{id}</td>
    <td>{label}</td>
  </tr>
));
