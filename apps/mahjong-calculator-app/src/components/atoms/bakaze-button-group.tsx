import { createElement } from 'preact';
import { memoNamed } from 'preact-utils';
import { Obj } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { type Bakaze } from '../../types/index.mjs';
import { ButtonGroupTyped } from '../bootstrap/index.mjs';

const bakazeButtons = [
  { id: 'Ton', displayName: '東' },
  { id: 'Nan', displayName: '南' },
] as const satisfies readonly Readonly<{ id: Bakaze; displayName: string }>[];

type Props = DeepReadonly<{
  selectedId: Bakaze;
  onClick: (id: Bakaze) => void;
}>;

export const BakazeButtonGroup = memoNamed<Props>(
  'BakazeButtonGroup',
  (props) =>
    createElement(
      ButtonGroupTyped<Bakaze>,
      Obj.merge(props, { buttons: bakazeButtons }),
    ),
);
