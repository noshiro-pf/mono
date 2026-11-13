import {
  constant,
  createAfterUpdate,
  isImeKeyDown,
  listenInScope,
  type JSX,
} from 'synstate-dom-next';
import { createState } from 'synstate-next';

export const SearchBox = (): JSX.Element => {
  // Starts from the query saved last time.
  const [query$, setQuery] = createState(
    sessionStorage.getItem('search') ?? '',
  );

  // Saves the query whenever it changes. Subscribed while the component mounts,
  // so it belongs to the component's owner, which unsubscribes it: what an
  // effect would do.
  query$.subscribe((query) => {
    sessionStorage.setItem('search', query);
  });

  // Removed with the owner, so a closed branch leaves no listener behind.
  listenInScope(globalThis, 'keydown', (event) => {
    if (
      event instanceof KeyboardEvent &&
      event.key === 'Escape' &&
      !isImeKeyDown(event)
    ) {
      setQuery('');
    }
  });

  // The input is in the document only once the whole description is mounted, so
  // it is focused after that.
  const afterUpdate = createAfterUpdate();

  let mut_input: HTMLInputElement | undefined = undefined;

  afterUpdate(() => {
    mut_input?.focus();
  });

  return (
    <input
      placeholder={constant('Search')}
      ref={(element) => {
        mut_input = element;
      }}
      value={query$}
      onInput={(event) => {
        setQuery(event.currentTarget.value);
      }}
    />
  );
};
