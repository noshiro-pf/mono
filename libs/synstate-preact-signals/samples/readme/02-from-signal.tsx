// embed-sample-code-ignore-above
import { signal } from '@preact/signals';
import { debounce } from 'synstate';
import { fromSignal } from 'synstate-preact-signals';

const input = signal('');

const [input$, dispose] = fromSignal(input);

const debouncedInput$ = input$.pipe(debounce(300));

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(debouncedInput$, dispose);
