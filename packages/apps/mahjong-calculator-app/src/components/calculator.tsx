import {
  bakaze$,
  jikaze$,
  setBakaze,
  setJikaze,
  setTehaiType,
  tehaiType$,
} from '../store';
import {
  BakazeButtonGroup,
  JikazeButtonGroup,
  TehaiTypeButtonGroup,
} from './atoms';

export const Calculator = memoNamed('Calculator', () => {
  const bakaze = useObservableValue(bakaze$);
  const jikaze = useObservableValue(jikaze$);
  const tehaiType = useObservableValue(tehaiType$);

  return (
    <div>
      <div>{'Calculator'}</div>
      <BakazeButtonGroup selectedId={bakaze} onClick={setBakaze} />
      <JikazeButtonGroup selectedId={jikaze} onClick={setJikaze} />
      <TehaiTypeButtonGroup selectedId={tehaiType} onClick={setTehaiType} />
    </div>
  );
});
