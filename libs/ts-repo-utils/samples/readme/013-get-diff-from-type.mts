import { type ExecException } from 'node:child_process';

type Ret = Result<
  readonly string[],
  ExecException | Readonly<{ message: string }>
>;

// embed-sample-code-ignore-below
export type { Ret };
