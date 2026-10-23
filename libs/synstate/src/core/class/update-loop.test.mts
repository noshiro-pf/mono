import { createState } from '../../utils/index.mjs';
import { map } from '../operators/index.mjs';
import { maxUpdateNesting, updateLoopMessage } from './propagation-state.mjs';

describe('an update that keeps starting another inside itself', () => {
  test('a subscriber that writes back to its own root throws a named error, not a stack overflow', () => {
    const [a$, setA] = createState(0);

    a$.subscribe((a) => {
      if (a > 0) {
        setA(a + 1);
      }
    });

    withoutWarnings(() => {
      expect(() => {
        setA(1);
      }).toThrow(updateLoopMessage);
    });
  });

  test('two subscribers writing to each other’s roots throw the same error', () => {
    const [a$, setA] = createState(0);

    const [b$, setB] = createState(0);

    a$.subscribe((a) => {
      if (a > 0) {
        setB(a + 1);
      }
    });

    b$.subscribe((b) => {
      if (b > 0) {
        setA(b + 1);
      }
    });

    withoutWarnings(() => {
      expect(() => {
        setA(1);
      }).toThrow(updateLoopMessage);
    });
  });

  test('updates work as before once the loop has thrown', () => {
    const [a$, setA] = createState(0);

    a$.subscribe((a) => {
      if (a > 0) {
        setA(a + 1);
      }
    });

    withoutWarnings(() => {
      expect(() => {
        setA(1);
      }).toThrow(updateLoopMessage);
    });

    const [b$, setB] = createState(0);

    const mut_received: number[] = [];

    b$.pipe(map((b) => b * 10)).subscribe((b) => {
      mut_received.push(b);
    });

    setB(1);

    setB(2);

    assert.deepStrictEqual(mut_received, [0, 10, 20]);
  });

  test('a write that converges may nest up to the limit', () => {
    const [a$, setA, { getSnapshot }] = createState(0);

    a$.subscribe((a) => {
      if (0 < a && a < maxUpdateNesting) {
        setA(a + 1);
      }
    });

    withoutWarnings(() => {
      setA(1);
    });

    assert.strictEqual(getSnapshot(), maxUpdateNesting);
  });
});

/**
 * Runs `run` with `console.warn` silenced: every case here writes from a
 * subscriber, which warns once per root.
 */
const withoutWarnings = (run: () => void): void => {
  vi.stubGlobal('console', { ...console, warn: vi.fn() });

  run();

  // cspell:disable-next-line
  vi.unstubAllGlobals();
};
