import { type MutableMap } from 'ts-type-forge';

type User = Readonly<{ id: number; name: string }>;

// embed-sample-code-ignore-above

type UserCache = MutableMap<string, User>;
const cache: UserCache = new Map();
cache.set('user1', { id: 1, name: 'Alice' }); // ✓ allowed - map is mutable
cache.delete('user1'); // ✓ allowed

// embed-sample-code-ignore-below
export { cache };
export type { UserCache };
