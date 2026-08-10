import { type ReadonlyRecord } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Config = ReadonlyRecord<string, string | number>;
const settings: Config = { host: 'localhost', port: 3000 } as const;
// settings.host = 'new-host'; // Error: Cannot assign to 'host' because it is a read-only property

// embed-sample-code-ignore-below
export { settings };
export type { Config };
