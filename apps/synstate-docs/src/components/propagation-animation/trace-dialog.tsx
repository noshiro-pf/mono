import * as React from 'react';

type Props = Readonly<{
  children: React.ReactNode;
  onClose: () => void;
}>;

/**
 * A modal dialog covering the whole window, opened as soon as it mounts.
 * Escape closes it, as it does any modal `<dialog>`; `onClose` is told so that
 * the owner can unmount it.
 */
export const TraceDialog = React.memo<Props>((props) => {
  const { children, onClose } = props;

  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog ref={ref} className={'propagation-trace-dialog'} onClose={onClose}>
      {children}
    </dialog>
  );
});

TraceDialog.displayName = 'TraceDialog';
