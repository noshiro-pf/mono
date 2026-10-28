import { memoNamed } from 'preact-utils';
import { useObservableValue } from 'synstate-preact-hooks';
import { calculatorStore } from '../store/index.mjs';
import {
  BakazeButtonGroup,
  JikazeButtonGroup,
  TehaiTypeButtonGroup,
} from './atoms/index.mjs';

export const Calculator = memoNamed('Calculator', () => {
  const bakaze = useObservableValue(calculatorStore.bakaze);

  const jikaze = useObservableValue(calculatorStore.jikaze);

  const tehaiType = useObservableValue(calculatorStore.tehaiType);

  return (
    <div>
      <div>{'Calculator'}</div>
      <BakazeButtonGroup
        selectedId={bakaze}
        onClick={calculatorStore.setBakaze}
      />
      <JikazeButtonGroup
        selectedId={jikaze}
        onClick={calculatorStore.setJikaze}
      />
      <TehaiTypeButtonGroup
        selectedId={tehaiType}
        onClick={calculatorStore.setTehaiType}
      />
    </div>
  );
});
