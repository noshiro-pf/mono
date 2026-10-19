import { combine, createState, map } from 'synstate';
import {
  constant,
  For,
  If,
  MatchOptional,
  render,
  view,
  type JSX,
} from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';

type Item = Readonly<{ id: number; price: number }>;

/**
 * Everything a mounted app derives from the global stores counts its runs.
 * After unmounting, updating the stores must run none of them: a derivation
 * that still runs is one the scopes failed to dispose.
 */
describe('mount and unmount leave nothing running', () => {
  test('repeated mounts of For, If and MatchOptional', () => {
    const [items$, setItems] = createState<readonly Item[]>([]);

    const [taxRate$, setTaxRate] = createState(0.1);

    const [selected$, setSelected] = createState<Optional<number>>(
      Optional.none,
    );

    const mut_runs = { current: 0 };

    const counted =
      <A, B>(fn: (a: A) => B): ((a: A) => B) =>
      (a) => {
        mut_runs.current += 1;

        return fn(a);
      };

    const App = (): JSX.Element => {
      const hasItems$ = items$.pipe(map(counted(Arr.isNonEmpty)));

      return (
        <div>
          <If
            cond={hasItems$}
            then={
              <ul>
                <For items={items$} key={(item) => item.id}>
                  {(item$, index$) => (
                    <li>
                      {view(
                        index$,
                        counted((i) => `${i + 1}. `),
                      )}
                      {combine([item$, taxRate$]).pipe(
                        map(counted(([item, rate]) => item.price * (1 + rate))),
                      )}
                    </li>
                  )}
                </For>
              </ul>
            }
            else={<p>{constant('empty')}</p>}
          />
          <MatchOptional
            value={selected$}
            some={(id$) => (
              <b>
                {view(
                  id$,
                  counted((id) => id),
                )}
              </b>
            )}
          />
        </div>
      );
    };

    const container = document.createElement('div');

    for (const round of [1, 2, 3, 4, 5]) {
      const unmount = render(App, container);

      setItems([
        { id: 1, price: 100 },
        { id: 2, price: 200 },
      ]);

      setSelected(Optional.some(round));

      setTaxRate(0.08 * round);

      setItems([{ id: 2, price: 200 }]);

      unmount();

      assert.strictEqual(container.getHTML(), '');

      const runsAfterUnmount = mut_runs.current;

      setItems([
        { id: 3, price: 300 },
        { id: 4, price: 400 },
      ]);

      setTaxRate(0.2);

      setSelected(Optional.some(99));

      assert.strictEqual(mut_runs.current, runsAfterUnmount);

      setItems([]);

      setSelected(Optional.none);
    }
  });
});
