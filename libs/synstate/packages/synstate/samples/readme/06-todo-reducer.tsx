import * as React from 'react';
import { createReducer } from 'synstate';

type Todo = Readonly<{ id: number; text: string; done: boolean }>;

type Action = Readonly<
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: number }
  | { type: 'remove'; id: number }
>;

const [todoState, dispatch, getSnapshot] = createReducer<
  readonly Todo[],
  Action
>((todos, action) => {
  switch (action.type) {
    case 'add':
      return [
        ...todos,
        {
          id: Date.now(),
          text: action.text,
          done: false,
        },
      ];
    case 'toggle':
      return todos.map((t) =>
        t.id === action.id ? { ...t, done: !t.done } : t,
      );
    case 'remove':
      return todos.filter((t) => t.id !== action.id);
  }
}, []);

const TodoList = (): React.JSX.Element => {
  const [todos, setTodos] = React.useState(getSnapshot());

  React.useEffect(() => {
    const sub = todoState.subscribe(setTodos);

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return (
    <div>
      {todos.map((todo) => (
        <div key={todo.id}>
          <input
            checked={todo.done}
            type={'checkbox'}
            onChange={() => {
              dispatch({
                type: 'toggle',
                id: todo.id,
              });
            }}
          />
          <span>{todo.text}</span>
        </div>
      ))}
      <button
        onClick={() => {
          dispatch({
            type: 'add',
            text: 'New Todo',
          });
        }}
      >
        {'Add Todo'}
      </button>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(TodoList);
