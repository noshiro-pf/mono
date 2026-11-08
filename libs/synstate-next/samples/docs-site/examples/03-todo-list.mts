import { createReducer, createState, derive, map } from 'synstate-next';
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('a todo list', () => {
    // embed-sample-code-ignore-above
    type Todo = Readonly<{ id: number; title: string; done: boolean }>;

    // `nextId` only grows, so an id is never given twice, even after a remove.
    type Todos = Readonly<{ items: readonly Todo[]; nextId: number }>;

    type Action = Readonly<
      | { type: 'add'; title: string }
      | { type: 'toggle'; id: number }
      | { type: 'remove'; id: number }
    >;

    const reducer = (state: Todos, action: Action): Todos => {
      switch (action.type) {
        case 'add':
          return {
            items: Arr.toPushed(state.items, {
              id: state.nextId,
              title: action.title,
              done: false,
            }),
            nextId: state.nextId + 1,
          };

        case 'toggle':
          return {
            ...state,
            items: state.items.map((t) =>
              t.id === action.id ? { ...t, done: !t.done } : t,
            ),
          };

        case 'remove':
          return {
            ...state,
            items: state.items.filter((t) => t.id !== action.id),
          };
      }
    };

    const [todos, dispatch] = createReducer(reducer, { items: [], nextId: 1 });

    const [filterBy, setFilterBy] = createState<'all' | 'active' | 'done'>(
      'all',
    );

    const visible = derive([todos, filterBy], ({ items }, by) =>
      by === 'all' ? items : items.filter((t) => t.done === (by === 'done')),
    );

    const remaining = todos.pipe(
      map(({ items }) => items.filter((t) => !t.done).length),
    );

    dispatch({ type: 'add', title: 'Write the docs' });

    dispatch({ type: 'add', title: 'Review them' });

    dispatch({ type: 'toggle', id: 1 });

    setFilterBy('active');

    assert.deepStrictEqual(
      visible.value.map((t) => t.title),
      ['Review them'],
    );

    assert.strictEqual(remaining.value, 1);

    // embed-sample-code-ignore-below
    dispatch({ type: 'remove', id: 2 });

    dispatch({ type: 'add', title: 'Publish them' });

    assert.deepStrictEqual(
      todos.value.items.map((t) => t.id),
      [1, 3],
    );
  });
}
