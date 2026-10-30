import type { Bindable, JSX } from 'synstate-dom';
import type { Bakaze } from '../../types/index.mjs';
import { ButtonGroup } from '../bootstrap/index.mjs';

type Props = Readonly<{
  selectedId: Bindable<Bakaze>;
  onClick: (id: Bakaze) => void;
}>;

export const BakazeButtonGroup = ({
  selectedId,
  onClick,
}: Props): JSX.Element => (
  <ButtonGroup
    buttons={bakazeButtons}
    label={'場風'}
    selectedId={selectedId}
    onClick={onClick}
  />
);

const bakazeButtons = [
  { id: 'Ton', displayName: '東' },
  { id: 'Nan', displayName: '南' },
] as const satisfies readonly Readonly<{ id: Bakaze; displayName: string }>[];
