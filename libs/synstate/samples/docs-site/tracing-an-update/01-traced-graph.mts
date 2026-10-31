import { combine, createState, filter, map } from 'synstate';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('traced-graph', () => {
    // embed-sample-code-ignore-above
    const [A, setA] = createState(0);

    const B = A.pipe(map((n) => n * 10)); // depth 1

    const D = A.pipe(filter((n) => n % 2 === 0)); // depth 1

    const BD = combine([B, D]); // depth 2

    const C = BD.pipe(map(([b, d]) => b + d)); // depth 3

    const E = D.pipe(map((n) => n * 10)); // depth 2

    setA(1); // B = 10, BD = [10, 0], C = 10; D rejects 1, so E is not reached

    setA(2); // B = 20, D = 2, BD = [20, 2], E = 20, C = 22
    // embed-sample-code-ignore-below

    assert.deepStrictEqual(
      [A.depth, B.depth, D.depth, BD.depth, C.depth, E.depth],
      [0, 1, 1, 2, 3, 2],
    );

    // Back to the initial values, then the two updates again, logging the order
    // in which the nodes emit, which the trace on the docs page steps through.
    setA(0);

    const mut_log: string[] = [];

    const log = (line: string): void => {
      mut_log.push(line);
    };

    const subscriptions = [
      A.subscribe((v) => {
        log(`A ${v.toString()}`);
      }),
      B.subscribe((v) => {
        log(`B ${v.toString()}`);
      }),
      D.subscribe((v) => {
        log(`D ${v.toString()}`);
      }),
      BD.subscribe((v) => {
        log(`BD ${v.join(',')}`);
      }),
      C.subscribe((v) => {
        log(`C ${v.toString()}`);
      }),
      E.subscribe((v) => {
        log(`E ${v.toString()}`);
      }),
    ] as const;

    /** The lines logged while `run` runs. */
    const logOf = (run: () => void): readonly string[] => {
      const start = mut_log.length;

      run();

      return mut_log.slice(start);
    };

    assert.deepStrictEqual(
      logOf(() => {
        setA(1);
      }),
      ['A 1', 'B 10', 'BD 10,0', 'C 10'],
    );

    assert.deepStrictEqual(
      logOf(() => {
        setA(2);
      }),
      ['A 2', 'B 20', 'D 2', 'BD 20,2', 'E 20', 'C 22'],
    );

    for (const s of subscriptions) {
      s.unsubscribe();
    }
  });
}
