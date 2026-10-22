import { createState } from 'synstate';
import { Arr } from 'ts-data-forge';

export type Todo = Readonly<{
  id: number;
  title: string;
  done: boolean;
}>;

export type TodoFilter = 'active' | 'all' | 'done';

// The app's state lives here, outside any component, for as long as the page
// does. What only a view reads is derived inside that view's component.

export const [todos$, , { updateState: updateTodos }] = createState<
  readonly Todo[]
>([
  { id: 1, title: 'Read the synstate-dom README', done: true },
  { id: 2, title: 'Run this app with `pnpm run dev`', done: false },
]);

export const [filter$, setFilter] = createState<TodoFilter>('all');

export const addTodo = (title: string): void => {
  updateTodos((todos) =>
    Arr.toPushed(todos, {
      id: Math.max(0, ...todos.map((t) => t.id)) + 1,
      title,
      done: false,
    }),
  );
};

export const toggleTodo = (id: number): void => {
  updateTodos((todos) =>
    todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  );
};

export const removeTodo = (id: number): void => {
  updateTodos((todos) => todos.filter((t) => t.id !== id));
};

export const clearDone = (): void => {
  updateTodos((todos) => todos.filter((t) => !t.done));
};

export const matchesFilter = (filter: TodoFilter, todo: Todo): boolean => {
  switch (filter) {
    case 'all':
      return true;

    case 'active':
      return !todo.done;

    case 'done':
      return todo.done;
  }
};
