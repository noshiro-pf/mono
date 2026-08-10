import { source } from '../create/index.mjs';
import { audit } from './audit.mjs';
import { throttle } from './throttle.mjs';

describe('completing before any emission', () => {
  test('audit tears down without a pending timer', () => {
    const audited$ = source<number>().pipe(audit(10));

    audited$.complete();

    assert.isTrue(audited$.isCompleted);
  });

  test('throttle tears down without a pending timer', () => {
    const throttled$ = source<number>().pipe(throttle(10));

    throttled$.complete();

    assert.isTrue(throttled$.isCompleted);
  });
});
