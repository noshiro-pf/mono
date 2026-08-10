import { type Mutable } from 'ts-type-forge';

// embed-sample-code-ignore-above

type ReadonlyUser = Readonly<{
  id: number;
  name: string;
  email: string;
}>;

type MutableUser = Mutable<ReadonlyUser>;
// Result: { id: number; name: string; email: string }

const user: MutableUser = { id: 1, name: 'Alice', email: 'alice@example.com' };
user.name = 'Alice Smith'; // ✓ allowed - property is mutable

// Useful for creating editable versions of readonly data
type Config = Readonly<{ host: string; port: number; ssl: boolean }>;
type EditableConfig = Mutable<Config>; // { host: string; port: number; ssl: boolean }

// embed-sample-code-ignore-below
export { user };
export type { Config, EditableConfig, MutableUser, ReadonlyUser };
