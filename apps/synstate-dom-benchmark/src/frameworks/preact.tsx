/** @jsxImportSource preact */
import { render } from 'preact';
import { memo } from 'preact/compat';
import { useState } from 'preact/hooks';
import type { Framework } from '../bench-app.mjs';
import {
  createTableOperations,
  emptyTable,
  type TableState,
} from '../table-state.mjs';

/**
 * Preact without Signals, written as the React implementation is: the table is
 * one state, re-rendered with keys, and each row is a `memo` component.
 * Preact renders a state change in a microtask, which the harness waits for.
 */
export const preact: Framework = {
  name: 'Preact',
  mount: (container) => {
    const mut_view: { setState: ((state: TableState) => void) | undefined } = {
      setState: undefined,
    };

    const App = (): preact.JSX.Element => {
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

    render(<App />, container);

    return createTableOperations(
      (state) => {
        mut_view.setState?.(state);
      },
      () => {
        render(null, container);
      },
    );
  },
} as const;

type RowProps = Readonly<{
  id: number;
  label: string;
  selected: boolean;
}>;

const Row = memo(({ id, label, selected }: RowProps): preact.JSX.Element => (
  <tr class={selected ? 'danger' : ''}>
    <td>{id}</td>
    <td>{label}</td>
  </tr>
));
