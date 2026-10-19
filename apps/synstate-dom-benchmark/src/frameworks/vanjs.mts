import van, { type State } from 'vanjs-core';
import type { BenchApp, Framework } from '../bench-app.mjs';
import { createRowFactory } from '../data.mjs';

const { table, tbody, td, tr } = van.tags;

type VanRow = Readonly<{
  id: number;
  label: State<string>;
  element: HTMLTableRowElement;
}>;

/**
 * VanJS with no add-on: a state per label and one for the selection, and the
 * list kept by hand, moving and removing the row elements directly, as
 * js-framework-benchmark's VanJS implementation does.
 *
 * VanJS applies state changes to the DOM in a `setTimeout` of its own, which
 * the harness waits for along with everything else.
 */
export const vanjs: Framework = {
  name: 'VanJS',
  mount: (container) => {
    const factory = createRowFactory();

    const mut_selected = van.state<number | undefined>(undefined);

    const body = tbody();

    const mut_rows: { current: readonly VanRow[] } = { current: [] };

    const build = (count: number): readonly VanRow[] =>
      factory.build(count).map(({ id, label }) => {
        const labelState = van.state(label);

        const element = tr(
          { class: () => (mut_selected.val === id ? 'danger' : '') },
          td(id),
          td(labelState),
        );

        return { id, label: labelState, element };
      });

    van.add(container, table(body));

    return {
      run: (count) => {
        mut_rows.current = build(count);

        body.replaceChildren(...mut_rows.current.map((row) => row.element));
      },
      add: (count) => {
        const added = build(count);

        mut_rows.current = [...mut_rows.current, ...added];

        body.append(...added.map((row) => row.element));
      },
      update: () => {
        for (const [i, row] of mut_rows.current.entries()) {
          if (i % 10 !== 0) {
            continue;
          }

          const mut_label = row.label;

          mut_label.val = `${mut_label.val} !!!`;
        }
      },
      select: (index) => {
        mut_selected.val = mut_rows.current[index]?.id;
      },
      swapRows: () => {
        const rows = mut_rows.current;

        if (rows.length < 4) {
          return;
        }

        const a = rows[1];

        const b = rows.at(-2);

        if (a === undefined || b === undefined) {
          return;
        }

        const afterB = b.element.nextSibling;

        body.insertBefore(b.element, a.element);

        body.insertBefore(a.element, afterB);

        mut_rows.current = rows.with(1, b).with(rows.length - 2, a);
      },
      remove: (index) => {
        mut_rows.current[index]?.element.remove();

        mut_rows.current = mut_rows.current.toSpliced(index, 1);
      },
      clear: () => {
        body.replaceChildren();

        mut_rows.current = [];
      },
      dispose: () => {
        container.replaceChildren();
      },
    } satisfies BenchApp;
  },
} as const;
