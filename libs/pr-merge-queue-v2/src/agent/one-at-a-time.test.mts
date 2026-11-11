import { setTimeout as sleep } from 'node:timers/promises';
import { oneAtATime } from './one-at-a-time.mjs';

describe(oneAtATime, () => {
  test('runs the tasks one after another, in the order they were given', async () => {
    const run = oneAtATime();

    const mut_events: string[] = [];

    const task = (name: string, ms: number) => async (): Promise<string> => {
      mut_events.push(`${name} start`);

      await sleep(ms);

      mut_events.push(`${name} end`);

      return name;
    };

    const results = await Promise.all([
      run(task('a', 20)),
      run(task('b', 1)),
      run(task('c', 5)),
    ]);

    assert.deepStrictEqual(results, ['a', 'b', 'c']);

    assert.deepStrictEqual(mut_events, [
      'a start',
      'a end',
      'b start',
      'b end',
      'c start',
      'c end',
    ]);
  });

  test('goes on after a task that threw, which its caller hears of', async () => {
    const run = oneAtATime();

    const [failed, next] = await Promise.allSettled([
      run(() => Promise.reject(new Error('disk full'))),
      run(() => Promise.resolve('written')),
    ]);

    assert.strictEqual(failed.status, 'rejected');

    assert.deepStrictEqual(next, { status: 'fulfilled', value: 'written' });
  });
});
