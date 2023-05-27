import { createElement } from 'preact';
import { type Jikaze } from '../../types';
import { ButtonGroupTyped } from '../bootstrap';

const jikazeButtons = [
  { id: 'Ton', displayName: '東' },
  { id: 'Nan', displayName: '南' },
  { id: 'Sha', displayName: '西' },
  { id: 'Pei', displayName: '北' },
] as const satisfies readonly { id: Jikaze; displayName: string }[];

type Props = DeepReadonly<{
  selectedId: Jikaze;
  onClick: (id: Jikaze) => void;
}>;

export const JikazeButtonGroup = memoNamed<Props>(
  'JikazeButtonGroup',
  (props) =>
    createElement(
      ButtonGroupTyped<Jikaze>,
      Obj.merge(props, { buttons: jikazeButtons })
    )
);
