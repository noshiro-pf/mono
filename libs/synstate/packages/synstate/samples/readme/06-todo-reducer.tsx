/* eslint-disable import-x/no-extraneous-dependencies */
// embed-sample-code-ignore-above

import * as React from 'react';
import { createReducer } from 'synstate-react-hooks';

type Todo = Readonly<{
  id: number;
  text: string;
  done: boolean;
}>;

type Action = Readonly<
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: number }
  | { type: 'remove'; id: number }
>;

const initialTodos: readonly Todo[] = [];

const reducer = (todos: readonly Todo[], action: Action): readonly Todo[] => {
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
};

const [useTodoState, dispatch] = createReducer<readonly Todo[], Action>(
  reducer,
  initialTodos,
);

const addTodo = (): void => {
  dispatch({
    type: 'add',
    text: 'New Todo',
  });
};

const TodoList = (): React.JSX.Element => {
  const todos = useTodoState();

  const todosWithHandler = React.useMemo(
    () =>
      todos.map((todo) => ({
        ...todo,
        onToggle: () => {
          dispatch({
            type: 'toggle',
            id: todo.id,
          });
        },
        onRemove: () => {
          dispatch({
            type: 'remove',
            id: todo.id,
          });
        },
      })),
    [todos],
  );

  return (
    <div>
      {todosWithHandler.map((todo) => (
        <div key={todo.id}>
          <input
            checked={todo.done}
            type={'checkbox'}
            onChange={todo.onToggle}
          />
          <span>{todo.text}</span>
          <button onClick={todo.onRemove}>{'Remove'}</button>
        </div>
      ))}
      <button onClick={addTodo}>{'Add Todo'}</button>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(TodoList);
