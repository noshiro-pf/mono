import { produce } from 'immer';
import { noop } from './noop.mjs';

type State = Readonly<{ count: number }>;

{
  // ✅ OK: Using curried produce

  const update = produce<State>((draft) => {
    draft.count += 1;
  });

  noop(update);
}

{
  // ❌ NG: Using non-curried produce
  // eslint-disable-next-line immer-coding-style/prefer-curried-produce
  const update = (state: State): State =>
    produce(state, (draft) => {
      draft.count += 1;
    });

  noop(update);
}
