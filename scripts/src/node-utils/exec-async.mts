import { exec, type PromiseWithChild } from 'node:child_process';
import * as util from 'node:util';

export const execAsync = util.promisify(exec) satisfies (
  command: string,
) => PromiseWithChild<{
  stdout: string;
  stderr: string;
}>;
