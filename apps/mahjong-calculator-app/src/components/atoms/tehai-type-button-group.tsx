import type { Bindable, JSX } from 'synstate-dom';
import type { TehaiType } from '../../types/index.mjs';
import { ButtonGroup } from '../bootstrap/index.mjs';

type Props = Readonly<{
  selectedId: Bindable<TehaiType>;
  onClick: (id: TehaiType) => void;
}>;

export const TehaiTypeButtonGroup = ({
  selectedId,
  onClick,
}: Props): JSX.Element => (
  <ButtonGroup
    buttons={tehaiTypeButtons}
    label={'手牌の種類'}
    selectedId={selectedId}
    onClick={onClick}
  />
);

const tehaiTypeButtons = [
  { id: 'normal', displayName: '一般手' },
  { id: 'Chi-toi', displayName: '七対子手' },
  { id: 'Kokushi', displayName: '国士無双手' },
] as const satisfies readonly Readonly<{
  id: TehaiType;
  displayName: string;
}>[];
