import { createState } from 'synstate';
import {
  constant,
  derive,
  For,
  If,
  mapBindable,
  view,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import {
  addTodo,
  clearDone,
  filter$,
  matchesFilter,
  removeTodo,
  setFilter,
  todos$,
  toggleTodo,
  type TodoFilter,
} from '../store/index.mjs';

export const TodoList = (): JSX.Element => {
  const [draft$, setDraft, { getSnapshot: getDraft }] = createState('');

  // Derivations only this view reads are created here, so they exist only while
  // it is mounted (README "Guidelines").
  const visibleTodos = derive([todos$, filter$], (todos, filter) =>
    todos.filter((todo) => matchesFilter(filter, todo)),
  );

  const submit = (): void => {
    const title = getDraft().trim();

    if (title === '') {
      return;
    }

    addTodo(title);

    setDraft('');
  };

  return (
    <section>
      <h2>{constant('Todo list')}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          submit();
        }}
      >
        <input
          data-e2e={constant('todo-input')}
          placeholder={constant('What needs to be done?')}
          value={draft$}
          onInput={(e) => {
            setDraft(e.currentTarget.value);
          }}
        />
        <button type={constant('submit')} data-e2e={constant('todo-add')}>
          {constant('Add')}
        </button>
      </form>
      <p>
        {filterButton('all', 'All')}
        {filterButton('active', 'Active')}
        {filterButton('done', 'Done')}
      </p>
      <If
        cond={mapBindable(visibleTodos, Arr.isNonEmpty)}
        then={
          <ul data-e2e={constant('todo-items')}>
            <For items={visibleTodos} key={(todo) => todo.id}>
              {(todo$, index$) => (
                <li class={{ done: view(todo$, (todo) => todo.done) }}>
                  <label>
                    <input
                      type={constant('checkbox')}
                      checked={view(todo$, (todo) => todo.done)}
                      onChange={() => {
                        toggleTodo(todo$.getSnapshot().value.id);
                      }}
                    />
                    {view(index$, (i) => `${i + 1}. `)}
                    {view(todo$, (todo) => todo.title)}
                  </label>
                  <button
                    type={constant('button')}
                    aria-label={view(todo$, (todo) => `Remove ${todo.title}`)}
                    onClick={() => {
                      removeTodo(todo$.getSnapshot().value.id);
                    }}
                  >
                    {constant('×')}
                  </button>
                </li>
              )}
            </For>
          </ul>
        }
        else={<p>{constant('Nothing to show.')}</p>}
      />
      <p data-e2e={constant('todo-remaining')}>
        {view(todos$, (todos) => {
          const n = todos.filter((t) => !t.done).length;

          return `${n} item${n === 1 ? '' : 's'} left`;
        })}
      </p>
      <button
        type={constant('button')}
        disabled={view(todos$, (todos) => todos.every((t) => !t.done))}
        onClick={clearDone}
      >
        {constant('Clear done')}
      </button>
    </section>
  );
};

const filterButton = (filter: TodoFilter, label: string): JSX.Element => (
  <button
    type={constant('button')}
    class={{ selected: view(filter$, (f) => f === filter) }}
    onClick={() => {
      setFilter(filter);
    }}
  >
    {constant(label)}
  </button>
);
