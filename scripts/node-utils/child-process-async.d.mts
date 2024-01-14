import { type PromiseWithChild } from 'node:child_process';

export declare const execAsync: (command: string) => PromiseWithChild<{
  stdout: string;
  stderr: string;
}>;
