import { produce } from 'immer';
import { noop } from './noop.mjs';

type State = Readonly<{ count: number }>;

{
  // ✅ OK: Using curried produce

  const update = produce<State>((mut_draft) => {
    mut_draft.count += 1;
  });

  noop(update);
}

{
  // ❌ NG: Using non-curried produce
  // eslint-disable-next-line immer-coding-style/prefer-curried-produce
  const update = (state: State): State =>
    produce(state, (mut_draft) => {
      mut_draft.count += 1;
    });

  noop(update);
}

{
  // ❌ NG: A draft not named with the `mut_` prefix
  // eslint-disable-next-line immer-coding-style/mut-prefixed-draft
  const update = produce<State>((draft) => {
    // eslint-disable-next-line functional/immutable-data
    draft.count += 1;
  });

  noop(update);
}
