/** @jsxImportSource synstate-dom */
// embed-sample-code-ignore-above
import { createState, map } from 'synstate';
import { constant, For, If, isImeKeyDown, type JSX } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';

type Todo = Readonly<{ id: number; title: string; done: boolean }>;

const [todos$, , { updateState: updateTodos }] = createState<readonly Todo[]>([
  { id: 0, title: 'Read the guide', done: true },
  { id: 1, title: 'Try the demos', done: false },
]);

const [draft$, setDraft, { getSnapshot: getDraft }] = createState('');

const remaining$ = todos$.pipe(
  map((todos) => todos.filter((todo) => !todo.done).length),
);

// How many row functions `For` has called: once per todo, ever.
const mut_rowsCreated = { count: 0 };

export const TodoDemo = (): JSX.Element => (
  <div>
    <div class={constant('controls')}>
      <input
        class={constant('input')}
        aria-label={constant('New todo')}
        placeholder={constant('What needs doing?')}
        value={draft$}
        onInput={(event) => {
          setDraft(event.currentTarget.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !isImeKeyDown(event)) {
            add();
          }
        }}
      />
      <button type={constant('button')} onClick={add}>
        {constant('Add')}
      </button>
    </div>
    <If
      cond={todos$.pipe(map(Arr.isNonEmpty))}
      then={
        <ul class={constant('list')}>
          <For items={todos$} key={(todo) => todo.id}>
            {(todo$) => {
              mut_rowsCreated.count += 1;

              return (
                <li class={{ done: todo$.pipe(map((t) => t.done)) }}>
                  <label>
                    <input
                      type={constant('checkbox')}
                      checked={todo$.pipe(map((t) => t.done))}
                      onChange={() => {
                        toggle(Optional.unwrap(todo$.getSnapshot()).id);
                      }}
                    />
                    {todo$.pipe(map((t) => ` ${t.title}`))}
                  </label>
                  <span class={constant('note')}>
                    {constant(`row #${mut_rowsCreated.count}`)}
                  </span>
                  <button
                    type={constant('button')}
                    onClick={() => {
                      remove(Optional.unwrap(todo$.getSnapshot()).id);
                    }}
                  >
                    {constant('Remove')}
                  </button>
                </li>
              );
            }}
          </For>
        </ul>
      }
      else={<p>{constant('Nothing to do.')}</p>}
    />
    <p class={constant('status')}>
      {remaining$.pipe(map((n) => `${n} remaining`))}
    </p>
  </div>
);

const nextId = (todos: readonly Todo[]): number =>
  Math.max(-1, ...todos.map((t) => t.id)) + 1;

const add = (): void => {
  const title = getDraft().trim();

  if (title === '') {
    return;
  }

  updateTodos((todos) =>
    Arr.toPushed(todos, { id: nextId(todos), title, done: false }),
  );

  setDraft('');
};

const toggle = (id: number): void => {
  updateTodos((todos) =>
    todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  );
};

const remove = (id: number): void => {
  updateTodos((todos) => todos.filter((t) => t.id !== id));
};
