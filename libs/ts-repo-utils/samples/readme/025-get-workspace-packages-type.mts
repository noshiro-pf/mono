import { type JsonValue } from 'ts-type-forge';

type Package = Readonly<{
  name: string;
  path: string;
  packageJson: JsonValue;
  dependencies: Readonly<Record<string, string>>;
}>;

// embed-sample-code-ignore-below
export type { Package };
