import { Alert, type IconName20 } from 'blueprint-synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import { Description } from '../../atoms/index.mjs';
import { maxWidthModalClass } from '../../styled/index.mjs';

type Props = Readonly<{
  isOpen: Bindable<boolean>;
  onCancel: () => void;
  onConfirm: () => void;
  cancelButtonText: string;
  confirmButtonText: string;
  message: string;
  description?: string;
  icon: IconName20 | undefined;
  intent: Intent;
  loading?: Bindable<boolean>;
}>;

export const ConfirmDialog = ({
  isOpen,
  onCancel,
  onConfirm,
  cancelButtonText,
  confirmButtonText,
  message,
  description,
  icon,
  intent,
  loading,
}: Props): JSX.Element => (
  <Alert
    canEscapeKeyCancel
    canOutsideClickCancel
    cancelButtonText={constant(cancelButtonText)}
    class={maxWidthModalClass}
    confirmButtonText={constant(confirmButtonText)}
    icon={icon}
    intent={intent}
    isOpen={isOpen}
    loading={loading}
    onCancel={onCancel}
    onConfirm={onConfirm}
  >
    <p>{constant(message)}</p>
    {description === undefined ? (
      []
    ) : (
      <Description text={constant(description)} />
    )}
  </Alert>
);
