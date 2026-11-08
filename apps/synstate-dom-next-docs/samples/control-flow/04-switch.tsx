import { constant, Switch, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

type Page = Readonly<
  { kind: 'list' } | { kind: 'item'; id: number } | { kind: 'settings' }
>;

const [page$, setPage] = createState<Page>({ kind: 'list' });

// One branch per key. Moving from one item to another keeps the `item` branch,
// and its text follows `page$`; moving to the settings mounts another.
export const Router = (): JSX.Element => (
  <main>
    <Switch value={page$} key={(page) => page.kind}>
      {(kind) =>
        kind === 'list' ? (
          <ItemList />
        ) : kind === 'item' ? (
          <p>
            {page$.pipe(
              map((page) => (page.kind === 'item' ? `Item ${page.id}` : '')),
            )}
          </p>
        ) : (
          <p>{constant('Settings')}</p>
        )
      }
    </Switch>
  </main>
);

const ItemList = (): JSX.Element => (
  <button
    type={constant('button')}
    onClick={() => {
      setPage({ kind: 'item', id: 1 });
    }}
  >
    {constant('Open item 1')}
  </button>
);
