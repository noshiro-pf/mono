/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
// embed-sample-code-ignore-above
import * as React from 'react';
import { createState, map } from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { Arr } from 'ts-data-forge';

const [todos$, , { updateState: updateTodos }] = createState<readonly string[]>(
  ['Todo 1', 'Todo 2'],
);

const TodoItem = ({
  index,
}: Readonly<{ index: number }>): React.JSX.Element => {
  const todo = useObservableValue(
    React.useMemo(
      () => todos$.pipe(map((todos) => todos[index] ?? '')),
      [index],
    ),
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateTodos((prev) =>
      prev.map((t, i) => (i === index ? e.target.value : t)),
    );
  };

  return <input value={todo} onChange={handleChange} />;
};

const TodoList = (): React.JSX.Element => {
  const todosLength = useObservableValue(
    React.useMemo(() => todos$.pipe(map((todos) => todos.length)), []),
  );

  const addTodo = (): void => {
    updateTodos(Arr.toPushed(''));
  };

  return (
    <div>
      {Array.from({ length: todosLength }, (_, i) => (
        <TodoItem key={i} index={i} />
      ))}
      <button onClick={addTodo}>{'Add'}</button>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(TodoList);
