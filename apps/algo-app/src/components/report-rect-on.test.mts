import { createScope, createState } from 'synstate';
import type { Rect } from 'ts-utils-additional';
import { reportRectOn } from './report-rect-on.mjs';

describe(reportRectOn, () => {
  test('reports the rect once the update has finished, and again only when it changed', async () => {
    const scope = createScope(undefined);

    const [measureOn, setMeasureOn] = createState(0);

    const mut_rect: { current: Rect } = { current: rectA };

    const mut_reported: Rect[] = [];

    const ref = scope.run(() =>
      reportRectOn(measureOn, (rect) => {
        mut_reported.push(rect);
      }),
    );

    ref({ getBoundingClientRect: () => mut_rect.current });

    assert.deepStrictEqual(mut_reported, []);

    await Promise.resolve();

    assert.deepStrictEqual(mut_reported, [rectA]);

    setMeasureOn(1);

    await Promise.resolve();

    assert.deepStrictEqual(mut_reported, [rectA]);

    mut_rect.current = rectB;

    setMeasureOn(2);

    await Promise.resolve();

    assert.deepStrictEqual(mut_reported, [rectA, rectB]);
  });

  test('reads every rect before reporting any', async () => {
    const scope = createScope(undefined);

    const [measureOn] = createState(0);

    const mut_log: string[] = [];

    for (const name of ['a', 'b']) {
      const ref = scope.run(() =>
        reportRectOn(measureOn, () => {
          mut_log.push(`report ${name}`);
        }),
      );

      ref({
        getBoundingClientRect: () => {
          mut_log.push(`read ${name}`);

          return rectA;
        },
      });
    }

    await Promise.resolve();

    assert.deepStrictEqual(mut_log, [
      'read a',
      'read b',
      'report a',
      'report b',
    ]);
  });

  test('a report that throws keeps no other from being sent, and is sent again next time', async () => {
    const scope = createScope(undefined);

    const [measureOn, setMeasureOn] = createState(0);

    const mut_log: string[] = [];

    const mut_failing: { current: boolean } = { current: true };

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const failingRef = scope.run(() =>
      reportRectOn(measureOn, () => {
        if (mut_failing.current) {
          throw new Error('failed');
        }

        mut_log.push('report a');
      }),
    );

    failingRef({ getBoundingClientRect: () => rectA });

    const ref = scope.run(() =>
      reportRectOn(measureOn, () => {
        mut_log.push('report b');
      }),
    );

    ref({ getBoundingClientRect: () => rectA });

    await Promise.resolve();

    assert.deepStrictEqual(mut_log, ['report b']);

    assert.strictEqual(errorSpy.mock.calls.length, 1);

    mut_failing.current = false;

    setMeasureOn(1);

    await Promise.resolve();

    assert.deepStrictEqual(mut_log, ['report b', 'report a']);

    errorSpy.mockRestore();
  });

  test('a measurement that throws keeps no other from being taken, and is taken again next time', async () => {
    const scope = createScope(undefined);

    const [measureOn, setMeasureOn] = createState(0);

    const mut_log: string[] = [];

    const mut_failing: { current: boolean } = { current: true };

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const failingRef = scope.run(() =>
      reportRectOn(measureOn, () => {
        mut_log.push('report a');
      }),
    );

    failingRef({
      getBoundingClientRect: () => {
        if (mut_failing.current) {
          throw new Error('failed');
        }

        return rectA;
      },
    });

    const ref = scope.run(() =>
      reportRectOn(measureOn, () => {
        mut_log.push('report b');
      }),
    );

    ref({ getBoundingClientRect: () => rectA });

    await Promise.resolve();

    assert.deepStrictEqual(mut_log, ['report b']);

    mut_failing.current = false;

    setMeasureOn(1);

    await Promise.resolve();

    assert.deepStrictEqual(mut_log, ['report b', 'report a']);

    errorSpy.mockRestore();
  });

  test('measures nothing once its scope is disposed', async () => {
    const scope = createScope(undefined);

    const [measureOn, setMeasureOn] = createState(0);

    const mut_reported: Rect[] = [];

    const ref = scope.run(() =>
      reportRectOn(measureOn, (rect) => {
        mut_reported.push(rect);
      }),
    );

    ref({ getBoundingClientRect: () => rectA });

    scope.dispose();

    setMeasureOn(1);

    await Promise.resolve();

    assert.deepStrictEqual(mut_reported, []);
  });
});

const rectA: Rect = { top: 1, left: 2, width: 3, height: 4 } as const;

const rectB: Rect = { top: 1, left: 2, width: 3, height: 5 } as const;
