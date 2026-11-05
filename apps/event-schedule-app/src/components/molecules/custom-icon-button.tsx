import { Button } from 'blueprint-synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import { CustomIcon } from '../atoms/index.mjs';

type Props = Readonly<{
  active?: Bindable<boolean>;
  'data-e2e'?: string;
  iconName: AnswerIconIdWithNone;
  outlined?: boolean;
  iconColor?: Bindable<string>;
  title: Bindable<string>;
  onClick: () => void;
}>;

/** A button drawn as an answer icon, ○ △ ×. */
export const CustomIconButton = ({
  active,
  'data-e2e': e2e,
  iconName,
  outlined = false,
  iconColor,
  title,
  onClick,
}: Props): JSX.Element => (
  <Button
    active={active}
    data-e2e={e2e === undefined ? undefined : constant(e2e)}
    iconElement={<CustomIcon color={iconColor} iconName={iconName} />}
    title={title}
    variant={constant(outlined ? 'outlined' : 'minimal')}
    onClick={onClick}
  />
);
