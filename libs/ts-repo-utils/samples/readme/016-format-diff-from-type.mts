import { type ExecException } from 'node:child_process';

type Ret = Promise<
  Result<
    undefined,
    | ExecException
    | Readonly<{ message: string }>
    | readonly unknown[]
  >
>;

// embed-sample-code-ignore-below
export type { Ret };
