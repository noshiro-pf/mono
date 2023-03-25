import { createElement } from 'preact';
import { type Bakaze } from '../../types';
import { ButtonGroupTyped } from '../bootstrap';

const bakazeButtons = [
  { id: 'Ton', displayName: '東' },
  { id: 'Nan', displayName: '南' },
] as const satisfies readonly { id: Bakaze; displayName: string }[];

type Props = DeepReadonly<{
  selectedId: Bakaze;
  onClick: (id: Bakaze) => void;
}>;

export const BakazeButtonGroup = memoNamed<Props>(
  'BakazeButtonGroup',
  (props) =>
    createElement(
      ButtonGroupTyped<Bakaze>,
      Obj.merge(props, { buttons: bakazeButtons })
    )
);
