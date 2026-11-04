// cspell:ignore unstub
import type * as Synstate from '../src/index.mjs';

// The check is chosen once, when the module loads, so each case loads a copy of
// synstate of its own with `NODE_ENV` set as the build would set it, and gets
// back a function that makes a child of a cycle with that copy.
const loadCopy = async (
  nodeEnv: 'development' | 'production',
): Promise<() => void> => {
  onTestFinished(() => {
    vi.unstubAllEnvs();

    // The Node.js project does not isolate test files, so a later file in this
    // worker would otherwise import the copy loaded here.
    vi.resetModules();
  });

  vi.stubEnv('NODE_ENV', nodeEnv);

  vi.resetModules();

  const { map, source }: typeof Synstate = await import('../src/index.mjs');

  // A parent that lists itself as its own parent: the public API cannot make
  // one, so its readonly `parents` is rewritten.
  return () => {
    const mut_a = source(0).pipe(map((x) => x));

    Object.defineProperty(mut_a, 'parents', {
      value: [mut_a],
      writable: false,
      configurable: true,
    });

    mut_a.pipe(map((x) => x));
  };
};

describe('the circular-dependency check by NODE_ENV', () => {
  // A control: it shows that the cycle made here trips the check, so that the
  // production case below is not passing for want of a cycle.
  test('a development build throws on a cycle', async () => {
    const makeChildOfCycle = await loadCopy('development');

    expect(makeChildOfCycle).toThrow(
      'Circular dependency detected in observable graph',
    );
  });

  test('a production build does not walk the ancestors', async () => {
    const makeChildOfCycle = await loadCopy('production');

    expect(makeChildOfCycle).not.toThrow();
  });
});
