import { createState, map, skipIfNoChange } from 'synstate';
import type { DeepReadonly } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('createState with keepEqualParts', () => {
    // embed-sample-code-ignore-above

    type PullReport = DeepReadonly<{
      summary: { open: number };
      pulls: { number: number; title: string }[];
    }>;

    const [report, setReport] = createState<PullReport>(
      { summary: { open: 0 }, pulls: [] },
      { keepEqualParts: true },
    );

    const summary = report.pipe(map((r) => r.summary)).pipe(skipIfNoChange());

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const summaryHistory: unknown[] = [];

    summary.subscribe((value) => {
      summaryHistory.push(value);
    });

    // A server answers each poll with the whole report, a new object every
    // time. What did not change keeps the object already held.
    setReport({
      summary: { open: 1 },
      pulls: [{ number: 1, title: 'one' }],
    });

    const held = report.getSnapshot().value;

    // An answer that changes nothing is not passed on at all.
    setReport({
      summary: { open: 1 },
      pulls: [{ number: 1, title: 'one' }],
    });

    assert.strictEqual(report.getSnapshot().value, held);

    // An edited title: a new report and a new array, while the summary is
    // the one held, so `summary` is not told of it.
    setReport({
      summary: { open: 1 },
      pulls: [{ number: 1, title: 'one (edited)' }],
    });

    assert.notStrictEqual(report.getSnapshot().value, held);

    assert.strictEqual(report.getSnapshot().value.summary, held.summary);

    assert.deepStrictEqual(summaryHistory, [{ open: 0 }, { open: 1 }]);

    // embed-sample-code-ignore-below
  });
}
