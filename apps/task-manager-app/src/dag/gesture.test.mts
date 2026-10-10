import {
  IDLE_GESTURE,
  pointerDown,
  pointerMove,
  pointerUp,
  type Gesture,
} from './gesture.mjs';
import type { ViewTransform } from './pan-zoom.mjs';

const identity: ViewTransform = { x: 0, y: 0, scale: 1 } as const;

describe(pointerDown, () => {
  test('starts tracking a pointer, not yet dragging', () => {
    const gesture = pointerDown(
      IDLE_GESTURE,
      { id: 1, x: 10, y: 10 },
      identity,
    );

    assert.deepStrictEqual(gesture.pointers, [{ id: 1, x: 10, y: 10 }]);

    assert.isFalse(gesture.dragging);
  });

  test('a second finger makes it a pinch, which is never a tap', () => {
    const gesture = pointerDown(
      pointerDown(IDLE_GESTURE, { id: 1, x: 0, y: 0 }, identity),
      { id: 2, x: 100, y: 0 },
      identity,
    );

    assert.strictEqual(gesture.pointers.length, 2);

    assert.isTrue(gesture.dragging);
  });
});

describe(pointerMove, () => {
  const down = pointerDown(IDLE_GESTURE, { id: 1, x: 10, y: 10 }, identity);

  test('does not pan for a small wobble, so a tap stays a tap', () => {
    const { gesture, transform } = pointerMove(down, { id: 1, x: 12, y: 11 });

    assert.isUndefined(transform);

    assert.isFalse(gesture.dragging);
  });

  test('pans by the distance moved once past the threshold', () => {
    const { gesture, transform } = pointerMove(down, { id: 1, x: 40, y: 30 });

    assert.isTrue(gesture.dragging);

    assert.deepStrictEqual(transform, { x: 30, y: 20, scale: 1 });
  });

  test('ignores a pointer it is not tracking', () => {
    const { gesture, transform } = pointerMove(down, { id: 9, x: 400, y: 0 });

    assert.strictEqual(gesture, down);

    assert.isUndefined(transform);
  });

  test('zooms with two fingers', () => {
    const pinching = pointerDown(down, { id: 2, x: 110, y: 10 }, identity);

    const { transform } = pointerMove(pinching, { id: 2, x: 210, y: 10 });

    assert.strictEqual(transform?.scale, 2);
  });
});

describe(pointerUp, () => {
  test('keeps saying it dragged until the next press, for the click after', () => {
    const moved = pointerMove(
      pointerDown(IDLE_GESTURE, { id: 1, x: 0, y: 0 }, identity),
      { id: 1, x: 50, y: 0 },
    ).gesture;

    const released = pointerUp(moved, 1, { x: 50, y: 0, scale: 1 }).gesture;

    assert.deepStrictEqual(released.pointers, []);

    assert.isTrue(released.dragging);

    assert.isFalse(
      pointerDown(released, { id: 2, x: 0, y: 0 }, identity).dragging,
    );
  });

  test('carries on panning with the finger left after a pinch', () => {
    const pinching: Gesture = pointerDown(
      pointerDown(IDLE_GESTURE, { id: 1, x: 0, y: 0 }, identity),
      { id: 2, x: 100, y: 0 },
      identity,
    );

    const after: ViewTransform = { x: 5, y: 5, scale: 2 } as const;

    const oneLeft = pointerUp(pinching, 2, after).gesture;

    const { transform } = pointerMove(oneLeft, { id: 1, x: 10, y: 0 });

    assert.deepStrictEqual(transform, { x: 15, y: 5, scale: 2 });
  });
});

describe('dragging a node', () => {
  const grab = { id: 'task:a', origin: { x: 100, y: 40 } } as const;

  const zoomed: ViewTransform = { x: 0, y: 0, scale: 2 } as const;

  const pressed = pointerDown(
    IDLE_GESTURE,
    { id: 1, x: 10, y: 10 },
    zoomed,
    grab,
  );

  test('is still a tap for a small wobble', () => {
    const { gesture, transform } = pointerMove(pressed, {
      id: 1,
      x: 13,
      y: 12,
    });

    assert.isFalse(gesture.dragging);

    assert.isUndefined(gesture.nodeDrag);

    assert.isUndefined(transform);
  });

  test('moves the node, not the view, once past the threshold', () => {
    const { gesture, transform } = pointerMove(pressed, {
      id: 1,
      x: 50,
      y: 30,
    });

    assert.isUndefined(transform);

    assert.isTrue(gesture.dragging);

    // 40 and 20 screen pixels at a zoom of 2.
    assert.deepStrictEqual(gesture.nodeDrag, {
      id: 'task:a',
      position: { x: 120, y: 50 },
    });
  });

  test('drops the node where it was on release, once', () => {
    const moved = pointerMove(pressed, { id: 1, x: 50, y: 30 }).gesture;

    const { gesture, dropped } = pointerUp(moved, 1, zoomed);

    assert.deepStrictEqual(dropped, {
      id: 'task:a',
      position: { x: 120, y: 50 },
    });

    assert.isUndefined(gesture.nodeDrag);

    // The click that follows is still swallowed.
    assert.isTrue(gesture.dragging);
  });

  test('drops nothing for a tap', () => {
    assert.isUndefined(pointerUp(pressed, 1, zoomed).dropped);
  });

  test('gives way to a pinch when a second finger comes down', () => {
    const moved = pointerMove(pressed, { id: 1, x: 50, y: 30 }).gesture;

    const pinching = pointerDown(moved, { id: 2, x: 200, y: 30 }, zoomed);

    assert.isUndefined(pinching.nodeDrag);

    const { gesture, transform } = pointerMove(pinching, {
      id: 2,
      x: 300,
      y: 30,
    });

    assert.isDefined(transform);

    assert.isUndefined(gesture.nodeDrag);

    // Neither finger lifting drops the node, and the one left pans.
    const oneLeft = pointerUp(gesture, 2, zoomed);

    assert.isUndefined(oneLeft.dropped);

    const panned = pointerMove(oneLeft.gesture, { id: 1, x: 80, y: 30 });

    assert.isDefined(panned.transform);

    assert.isUndefined(panned.gesture.nodeDrag);

    assert.isUndefined(pointerUp(panned.gesture, 1, zoomed).dropped);
  });
});
