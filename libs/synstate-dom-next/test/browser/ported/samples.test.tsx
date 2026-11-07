import {
  constant,
  For,
  If,
  mapBindable,
  render,
  type Bindable,
  type JSX,
} from 'synstate-dom-next';
import { createState, map } from 'synstate-next';
import { Arr } from 'ts-data-forge';

// synstate-dom's README samples, which its `samples.test.tsx` imports. Here
// they are written into the test, since synstate-dom-next's README has no
// samples yet: they come with the README that replaces synstate-dom's.
describe('README samples', () => {
  test('01-counter unmounts everything it mounted', () => {
    document.body.replaceChildren();

    const [count$, _setCount, { updateState: updateCount }] = createState(0);

    const Counter = (): JSX.Element => (
      <div>
        <p>{count$.pipe(map((n) => `Count: ${n}`))}</p>
        <button
          type={constant('button')}
          onClick={() => {
            updateCount((n) => n + 1);
          }}
        >
          {constant('+1')}
        </button>
      </div>
    );

    const unmount = render(Counter, document.body);

    document.body.querySelector('button')?.click();

    assert.deepStrictEqual(textsOf('p'), ['Count: 1']);

    unmount();

    assert.strictEqual(document.body.getHTML(), '');
  });

  test('02-todo-list adds, toggles and counts', () => {
    document.body.replaceChildren();

    const unmount = render(TodoApp, document.body);

    assert.deepStrictEqual(textsOf('p'), ['Nothing to do.', '0 remaining']);

    const mut_input = document.body.querySelector('input');

    const add = document.body.querySelector('button');

    assert.isNotNull(mut_input);

    assert.isNotNull(add);

    for (const title of ['milk', 'eggs']) {
      mut_input.value = title;

      mut_input.dispatchEvent(new Event('input'));

      add.click();
    }

    assert.strictEqual(mut_input.value, '');

    assert.deepStrictEqual(textsOf('li'), ['1. milk', '2. eggs']);

    const rows = Array.from(document.body.querySelectorAll('li'));

    assert.isTrue(Arr.isNonEmpty(rows));

    if (!Arr.isNonEmpty(rows)) {
      return;
    }

    rows[0].querySelector('input')?.click();

    assert.isTrue(rows[0].classList.contains('done'));

    assert.deepStrictEqual(textsOf('p'), ['1 remaining']);

    unmount();
  });

  test('03-bindable-props binds observables and constants alike', () => {
    document.body.replaceChildren();

    const [unread$, setUnread] = createState(3);

    const Inbox = (): JSX.Element => (
      <nav>
        <Badge label={constant('Inbox')} count={unread$} />
        <Badge label={constant('Archive')} count={constant(120)} />
        <button
          type={constant('button')}
          onClick={() => {
            setUnread(0);
          }}
        >
          {constant('Mark all read')}
        </button>
      </nav>
    );

    const unmount = render(Inbox, document.body);

    assert.deepStrictEqual(textsOf('span'), ['Inbox (3)', 'Archive (99+)']);

    document.body.querySelector('button')?.click();

    assert.deepStrictEqual(textsOf('span'), ['Inbox (0)', 'Archive (99+)']);

    unmount();
  });
});

type Todo = Readonly<{ id: number; title: string; done: boolean }>;

const [todos$, _setTodos, { updateState: updateTodos }] = createState<
  readonly Todo[]
>([]);

const [draft$, setDraft, { getSnapshot: getDraft }] = createState('');

const toggle = (id: number): void => {
  updateTodos((todos) =>
    todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  );
};

const addTodo = (): void => {
  const title = getDraft().trim();

  if (title === '') {
    return;
  }

  updateTodos((todos) =>
    Arr.toPushed(todos, { id: todos.length, title, done: false }),
  );

  setDraft('');
};

const TodoApp = (): JSX.Element => {
  const remaining$ = todos$.pipe(
    map((todos) => todos.filter((t) => !t.done).length),
  );

  return (
    <section>
      <input
        value={draft$}
        onInput={(e) => {
          setDraft(e.currentTarget.value);
        }}
      />
      <button type={constant('button')} onClick={addTodo}>
        {constant('Add')}
      </button>
      <If
        cond={todos$.pipe(map(Arr.isNonEmpty))}
        then={
          <ul>
            <For items={todos$} key={(todo) => todo.id}>
              {(todo$, index$) => (
                <li class={{ done: todo$.pipe(map((todo) => todo.done)) }}>
                  <label>
                    <input
                      type={constant('checkbox')}
                      checked={todo$.pipe(map((todo) => todo.done))}
                      onChange={() => {
                        toggle(todo$.value.id);
                      }}
                    />
                    {index$.pipe(map((i) => `${i + 1}. `))}
                    {todo$.pipe(map((todo) => todo.title))}
                  </label>
                </li>
              )}
            </For>
          </ul>
        }
        else={<p>{constant('Nothing to do.')}</p>}
      />
      <p>{remaining$.pipe(map((n) => `${n} remaining`))}</p>
    </section>
  );
};

type BadgeProps = Readonly<{
  label: Bindable<string>;
  count: Bindable<number>;
}>;

const Badge = ({ label, count }: BadgeProps): JSX.Element => (
  <span>
    {label}
    {mapBindable(count, (n) => (n > 99 ? ' (99+)' : ` (${n})`))}
  </span>
);

const textsOf = (selector: string): readonly string[] =>
  Array.from(document.body.querySelectorAll(selector), (e) => e.textContent);
