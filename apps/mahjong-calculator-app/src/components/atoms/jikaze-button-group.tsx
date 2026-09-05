import { createElement } from 'preact';
import { memoNamed } from 'preact-utils';
import { Obj } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { type Jikaze } from '../../types/index.mjs';
import { ButtonGroupTyped } from '../bootstrap/index.mjs';

const jikazeButtons = [
  { id: 'Ton', displayName: '東' },
  { id: 'Nan', displayName: '南' },
  { id: 'Sha', displayName: '西' },
  { id: 'Pei', displayName: '北' },
] as const satisfies readonly Readonly<{ id: Jikaze; displayName: string }>[];

type Props = DeepReadonly<{
  selectedId: Jikaze;
  onClick: (id: Jikaze) => void;
}>;

export const JikazeButtonGroup = memoNamed<Props>(
  'JikazeButtonGroup',
  (props) =>
    createElement(
      ButtonGroupTyped<Jikaze>,
      Obj.merge(props, { buttons: jikazeButtons }),
    ),
);
