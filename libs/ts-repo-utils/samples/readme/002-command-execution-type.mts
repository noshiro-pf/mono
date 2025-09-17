import { type ExecException } from 'node:child_process';

type Ret = Promise<
  Result<
    Readonly<{ stdout: string | Buffer; stderr: string | Buffer }>,
    ExecException
  >
>;

// embed-sample-code-ignore-below
export type { Ret };
