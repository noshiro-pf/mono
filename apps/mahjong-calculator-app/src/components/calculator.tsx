import { constant, type JSX } from 'synstate-dom';
import { calculatorStore } from '../store/index.mjs';
import {
  BakazeButtonGroup,
  JikazeButtonGroup,
  TehaiTypeButtonGroup,
} from './atoms/index.mjs';

export const Calculator = (): JSX.Element => (
  <div>
    <div>{constant('Calculator')}</div>
    <BakazeButtonGroup
      selectedId={calculatorStore.bakaze}
      onClick={calculatorStore.setBakaze}
    />
    <JikazeButtonGroup
      selectedId={calculatorStore.jikaze}
      onClick={calculatorStore.setJikaze}
    />
    <TehaiTypeButtonGroup
      selectedId={calculatorStore.tehaiType}
      onClick={calculatorStore.setTehaiType}
    />
  </div>
);
