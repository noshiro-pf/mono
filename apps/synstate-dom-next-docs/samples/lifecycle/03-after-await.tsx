import type { JSX } from 'synstate-dom-next';
import { createState, getOwner, map } from 'synstate-next';

type Profile = Readonly<{ name: string }>;

declare const fetchProfile: () => Promise<Profile>;

export const Greeting = (): JSX.Element => {
  const [name$, setName] = createState('');

  // Taken while the component mounts: the owner it is mounted in.
  const owner = getOwner();

  const load = async (): Promise<void> => {
    const profile = await fetchProfile();

    // After the `await`, no owner is current. A write needs none; something
    // made here that should go with the component is made in its owner, unless
    // the component was unmounted while the fetch was pending.
    setName(profile.name);

    if (owner === undefined || owner.disposed) {
      return;
    }

    owner.run(() => {
      name$.subscribe((name) => {
        console.info(`greeting ${name}`);
      });
    });
  };

  load().catch((error: unknown) => {
    console.error(error);
  });

  return <p>{name$.pipe(map((name) => `Hello, ${name}`))}</p>;
};
