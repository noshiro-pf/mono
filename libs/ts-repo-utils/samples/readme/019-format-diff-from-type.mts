import { type ExecException } from 'node:child_process';
import { type Result } from 'ts-data-forge';

type Ret = Promise<
  Result<
    undefined,
    ExecException | Readonly<{ message: string }> | readonly unknown[]
  >
>;

// embed-sample-code-ignore-below
export type { Ret };
