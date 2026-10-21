import { createState, type InitializedObservable } from 'synstate';
import { constant, MatchOptional, view, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';

type User = Readonly<{ name: string }>;

const [currentUser$] = createState<Optional<User>>(Optional.none);

const Profile = ({
  user$,
}: Readonly<{ user$: InitializedObservable<User> }>): JSX.Element => (
  <p>{view(user$, (u) => `Signed in as ${u.name}`)}</p>
);

// `some` is called once per change from empty to present. While a user stays
// signed in, a new value flows through `u$` and the branch is kept.
export const Account = (): JSX.Element => (
  <MatchOptional
    value={currentUser$}
    some={(u$) => <Profile user$={u$} />}
    none={<p>{constant('Not signed in')}</p>}
  />
);
