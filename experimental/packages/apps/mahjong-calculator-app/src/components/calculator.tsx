import {
  setBakaze,
  setJikaze,
  setTehaiType,
  useBakaze,
  useJikaze,
  useTehaiType,
} from '../store';
import {
  BakazeButtonGroup,
  JikazeButtonGroup,
  TehaiTypeButtonGroup,
} from './atoms';

export const Calculator = memoNamed('Calculator', () => {
  const bakaze = useBakaze();
  const jikaze = useJikaze();
  const tehaiType = useTehaiType();

  return (
    <div>
      <div>{'Calculator'}</div>
      <BakazeButtonGroup selectedId={bakaze} onClick={setBakaze} />
      <JikazeButtonGroup selectedId={jikaze} onClick={setJikaze} />
      <TehaiTypeButtonGroup selectedId={tehaiType} onClick={setTehaiType} />
    </div>
  );
});
