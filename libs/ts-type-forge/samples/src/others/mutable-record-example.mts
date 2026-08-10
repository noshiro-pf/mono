import { type MutableRecord } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Config = MutableRecord<string, string | number>;
const settings: Config = { host: 'localhost', port: 3000 };
settings['host'] = 'new-host'; // OK
settings['timeout'] = 5000; // OK

// embed-sample-code-ignore-below
export { settings };
export type { Config };
