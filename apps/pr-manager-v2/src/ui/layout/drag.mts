/**
 * Follows a pointer from `down` until it is let go, calling `move` with each
 * position. Pointer events rather than HTML drag and drop, which draws a ghost
 * image of its own and does not work with touch.
 */
export const dragFrom = (
  down: PointerEvent,
  move: (x: number, y: number) => void,
): void => {
  const target = down.currentTarget;

  if (!(target instanceof Element) || down.button !== 0) {
    return;
  }

  down.preventDefault();

  target.setPointerCapture(down.pointerId);

  // The stylesheet turns off text selection and keeps the cursor while set.
  document.documentElement.setAttribute(DRAGGING, 'true');

  const onMove = (event: Event): void => {
    if (event instanceof PointerEvent) {
      move(event.clientX, event.clientY);
    }
  };

  const onUp = (): void => {
    target.removeEventListener('pointermove', onMove);

    target.removeEventListener('pointerup', onUp);

    target.removeEventListener('pointercancel', onUp);

    target.removeEventListener('lostpointercapture', onUp);

    document.removeEventListener('lostpointercapture', onUp);

    document.documentElement.removeAttribute(DRAGGING);
  };

  target.addEventListener('pointermove', onMove);

  target.addEventListener('pointerup', onUp);

  target.addEventListener('pointercancel', onUp);

  // The capture is lost when the target leaves the page mid-drag, where no
  // pointerup comes; the event then goes to the document, not the target.
  target.addEventListener('lostpointercapture', onUp);

  document.addEventListener('lostpointercapture', onUp);
};

const DRAGGING = 'data-dragging';
