/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
// embed-sample-code-ignore-above
import { atom, useAtom, type PrimitiveAtom } from 'jotai';
import type * as React from 'react';

const todosAtom = atom([atom('Todo 1'), atom('Todo 2')]);

const TodoItem = ({
  todoAtom,
}: Readonly<{
  todoAtom: PrimitiveAtom<string>;
}>): React.JSX.Element => {
  const [todo, setTodo] = useAtom(todoAtom);

  return (
    <input
      value={todo}
      onChange={(e) => {
        setTodo(e.target.value);
      }}
    />
  );
};

const TodoList = (): React.JSX.Element => {
  const [todos, setTodos] = useAtom(todosAtom);

  const addTodo = (): void => {
    setTodos((prev) => [...prev, atom('')]);
  };

  return (
    <div>
      {todos.map((todoAtom, i) => (
        <TodoItem key={i} todoAtom={todoAtom} />
      ))}
      <button onClick={addTodo}>{'Add'}</button>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(TodoList);
