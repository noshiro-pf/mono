import { type JsonValue, type ReadonlyRecord } from 'ts-type-forge';

type Package = Readonly<{
  name: string;
  path: string;
  packageJson: JsonValue;
  dependencies: ReadonlyRecord<string, string>;
}>;

// embed-sample-code-ignore-below
export type { Package };
