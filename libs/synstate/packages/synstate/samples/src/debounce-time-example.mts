import { debounceTime, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(debounceTime, async () => {
    // embed-sample-code-ignore-above

    //  Timeline (300ms debounce):
    //
    //  Time(ms)  0     100    200    300    400    500    600   ...   900   1000
    //  input$    'h'   'he'   'hel'  'hello'
    //  debounced$                                         'hello' (emitted after 300ms silence)
    //
    //  Explanation:
    //  - At 0ms: 'h' is emitted, timer starts
    //  - At 100ms: 'he' is emitted, timer resets
    //  - At 200ms: 'hel' is emitted, timer resets
    //  - At 300ms: 'hello' is emitted, timer resets
    //  - At 600ms: No new emission for 300ms, 'hello' is finally emitted

    const input$ = source<string>();

    const debounced$ = input$.pipe(debounceTime(300));

    const mut_history: string[] = [];

    debounced$.subscribe((value) => {
      mut_history.push(value);
    });

    input$.next('h');

    input$.next('he');

    input$.next('hel');

    input$.next('hello');

    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });

    assert.deepStrictEqual(mut_history, ['hello']);

    // embed-sample-code-ignore-below
  });
}
