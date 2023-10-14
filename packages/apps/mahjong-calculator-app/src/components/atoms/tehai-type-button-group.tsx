import { createElement } from 'preact';
import { type TehaiType } from '../../types';
import { ButtonGroupTyped } from '../bootstrap';

const tehaiTypeButtons = [
  { id: 'normal', displayName: '一般手' },
  { id: 'Chi-toi', displayName: '七対子手' },
  { id: 'Kokushi', displayName: '国士無双手' },
] as const satisfies readonly { id: TehaiType; displayName: string }[];

type Props = DeepReadonly<{
  selectedId: TehaiType;
  onClick: (id: TehaiType) => void;
}>;

export const TehaiTypeButtonGroup = memoNamed<Props>(
  'TehaiTypeButtonGroup',
  (props) =>
    createElement(
      ButtonGroupTyped<TehaiType>,
      Obj.merge(props, { buttons: tehaiTypeButtons }),
    ),
);
