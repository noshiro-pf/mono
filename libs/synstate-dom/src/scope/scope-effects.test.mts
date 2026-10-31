import { createScope, createState } from 'synstate';
import {
  createAfterUpdate,
  listenInScope,
  subscribeInScope,
} from './scope-effects.mjs';

describe(subscribeInScope, () => {
  test('follows the source, the current value first, until the scope is disposed', () => {
    const scope = createScope(undefined);

    const [source, setSource] = createState(0);

    const mut_received: number[] = [];

    scope.run(() => {
      subscribeInScope(source, (value) => {
        mut_received.push(value);
      });
    });

    setSource(1);

    scope.dispose();

    setSource(2);

    assert.deepStrictEqual(mut_received, [0, 1]);
  });
});

describe(createAfterUpdate, () => {
  test('runs the work in a microtask, and drops it once the scope is disposed', async () => {
    const scope = createScope(undefined);

    const afterUpdate = scope.run(createAfterUpdate);

    const mut_log: string[] = [];

    afterUpdate(() => {
      mut_log.push('first');
    });

    assert.deepStrictEqual(mut_log, []);

    await Promise.resolve();

    assert.deepStrictEqual(mut_log, ['first']);

    afterUpdate(() => {
      mut_log.push('second');
    });

    scope.dispose();

    await Promise.resolve();

    assert.deepStrictEqual(mut_log, ['first']);
  });
});

describe(listenInScope, () => {
  test('listens, with the options it is given, until the scope is disposed', () => {
    const scope = createScope(undefined);

    const target = new EventTarget();

    const mut_received: string[] = [];

    scope.run(() => {
      listenInScope(
        target,
        'ping',
        (event) => {
          mut_received.push(event.type);
        },
        { capture: true },
      );
    });

    target.dispatchEvent(new Event('ping'));

    scope.dispose();

    target.dispatchEvent(new Event('ping'));

    assert.deepStrictEqual(mut_received, ['ping']);
  });
});
