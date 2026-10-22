import { constant, type JSX } from 'synstate-dom';
import { Counter } from './counter.js';
import { DialogDemo } from './dialog-demo.js';
import { StopwatchDemo } from './stopwatch-demo.js';
import { TodoList } from './todo-list.js';

export const App = (): JSX.Element => (
  <main>
    <h1>{constant('synstate-dom sample')}</h1>
    <Counter />
    <TodoList />
    <StopwatchDemo />
    <DialogDemo />
  </main>
);
