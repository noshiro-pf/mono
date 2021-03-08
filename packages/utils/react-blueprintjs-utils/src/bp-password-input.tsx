import { memoNamed, useToggleState } from '@noshiro/react-utils';
import { BpButton } from './bp-button';
import { BpInput } from './bp-input';

interface Props {
  password: string;
  onPasswordChange: (value: string) => void;
  disabled: boolean;
}

export const BpPasswordInput = memoNamed<Props>('BpPasswordInput', (props) => {
  const [showPassword, onToggleVisibilityClick] = useToggleState(false);

  return (
    <BpInput
      type={showPassword ? 'text' : 'password'}
      value={props.password}
      onValueChange={props.onPasswordChange}
      disabled={props.disabled}
      rightElement={
        <BpButton
          icon={showPassword ? 'eye-open' : 'eye-off'}
          minimal={true}
          onClick={onToggleVisibilityClick}
        />
      }
    />
  );
});
