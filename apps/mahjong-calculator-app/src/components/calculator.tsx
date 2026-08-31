import { memoNamed } from 'preact-utils';
import {
  setBakaze,
  setJikaze,
  setTehaiType,
  useBakaze,
  useJikaze,
  useTehaiType,
} from '../store/index.mjs';
import {
  BakazeButtonGroup,
  JikazeButtonGroup,
  TehaiTypeButtonGroup,
} from './atoms/index.mjs';

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
