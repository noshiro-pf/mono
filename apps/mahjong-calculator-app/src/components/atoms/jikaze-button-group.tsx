import type { Bindable, JSX } from 'synstate-dom';
import type { Jikaze } from '../../types/index.mjs';
import { ButtonGroup } from '../bootstrap/index.mjs';

type Props = Readonly<{
  selectedId: Bindable<Jikaze>;
  onClick: (id: Jikaze) => void;
}>;

export const JikazeButtonGroup = ({
  selectedId,
  onClick,
}: Props): JSX.Element => (
  <ButtonGroup
    buttons={jikazeButtons}
    label={'自風'}
    selectedId={selectedId}
    onClick={onClick}
  />
);

const jikazeButtons = [
  { id: 'Ton', displayName: '東' },
  { id: 'Nan', displayName: '南' },
  { id: 'Sha', displayName: '西' },
  { id: 'Pei', displayName: '北' },
] as const satisfies readonly Readonly<{ id: Jikaze; displayName: string }>[];
