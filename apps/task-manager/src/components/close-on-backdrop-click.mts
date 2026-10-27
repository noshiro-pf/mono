/**
 * Has a click on the backdrop of a modal `<dialog>` call `closeDialog`, and
 * returns what stops listening.
 *
 * The content fills the dialog, so an event whose target is the dialog
 * itself landed on the backdrop around it. The click alone does not say so:
 * a click goes to the nearest element that both the press and the release
 * were on, which is the dialog when a press in an input — selecting its
 * text — is let go of over the backdrop. So the press and the release must
 * each have been on the backdrop.
 *
 * Listened to on the element rather than through JSX: the backdrop is a
 * pointer convenience, and Escape is how a keyboard closes the dialog.
 */
export const closeOnBackdropClick = (
  dialog: HTMLElement,
  closeDialog: () => void,
): (() => void) => {
  let mut_pressedOnBackdrop = false;

  let mut_releasedOnBackdrop = false;

  const onPointerDown = (pressed: PointerEvent): void => {
    mut_pressedOnBackdrop = pressed.target === dialog;
  };

  const onPointerUp = (released: PointerEvent): void => {
    mut_releasedOnBackdrop = released.target === dialog;
  };

  const onClick = (clicked: MouseEvent): void => {
    if (
      mut_pressedOnBackdrop &&
      mut_releasedOnBackdrop &&
      clicked.target === dialog
    ) {
      closeDialog();
    }

    mut_pressedOnBackdrop = false;

    mut_releasedOnBackdrop = false;
  };

  dialog.addEventListener('pointerdown', onPointerDown);

  dialog.addEventListener('pointerup', onPointerUp);

  dialog.addEventListener('click', onClick);

  return () => {
    dialog.removeEventListener('pointerdown', onPointerDown);

    dialog.removeEventListener('pointerup', onPointerUp);

    dialog.removeEventListener('click', onClick);
  };
};
