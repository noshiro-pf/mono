import { isImeKeyDown } from './is-ime-key-down.mjs';

// Plain objects stand in for `KeyboardEvent`s: it reads only these fields, and
// Node.js has no `KeyboardEvent`.
describe(isImeKeyDown, () => {
  test('is a key down sent while an input method is composing', () => {
    assert.isTrue(isImeKeyDown(keyDown('a', 229, true)));

    assert.isTrue(isImeKeyDown(keyDown('ArrowUp', 229, true)));
  });

  test.each(['Enter', 'Escape'])(
    'is %s with key code 229, which Safari sends after compositionend',
    (key) => {
      assert.isTrue(isImeKeyDown(keyDown(key, 229)));
    },
  );

  test('is not another key with key code 229, as an Android virtual keyboard sends every key', () => {
    assert.isFalse(isImeKeyDown(keyDown('ArrowUp', 229)));
  });

  test.each([
    ['Enter', 13],
    ['Escape', 27],
    ['a', 65],
  ] as const)('is not a plain %s', (key, code) => {
    assert.isFalse(isImeKeyDown(keyDown(key, code)));
  });
});

/** The fields of a key down that `isImeKeyDown` reads. */
const keyDown = (
  key: string,
  code: number,
  isComposing: boolean = false,
): Readonly<{ key: string; keyCode: number; isComposing: boolean }> =>
  ({
    key,
    keyCode: code,
    isComposing,
  }) as const;
