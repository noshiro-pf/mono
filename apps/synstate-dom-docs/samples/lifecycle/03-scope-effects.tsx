import { createState } from 'synstate';
import {
  constant,
  createAfterUpdate,
  listenInScope,
  subscribeInScope,
  type JSX,
} from 'synstate-dom';

export const SearchBox = (): JSX.Element => {
  // Starts from the query saved last time.
  const [query$, setQuery] = createState(
    sessionStorage.getItem('search') ?? '',
  );

  // Saves the query whenever it changes, until the component's scope is
  // disposed: what an effect would do.
  subscribeInScope(query$, (query) => {
    sessionStorage.setItem('search', query);
  });

  // Removed with the scope, so a closed branch leaves no listener behind.
  listenInScope(globalThis, 'keydown', (event) => {
    if (event instanceof KeyboardEvent && event.key === 'Escape') {
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
