import { type ExecException, type ExecOptions as ExecOptions_ } from 'node:child_process';
import { Result } from 'ts-data-forge';
type ExecOptionsCustom = Readonly<{
    silent?: boolean;
}>;
type ExecOptions = DeepReadonly<ExecOptions_ & ExecOptionsCustom>;
type ExecResult<T extends string | Buffer> = Result<Readonly<{
    stdout: T;
    stderr: T;
}>, ExecException>;
/**
 * Executes a shell command asynchronously.
 *
 * @param command - The command to execute.
 * @param options - Optional configuration for command execution.
 * @returns A promise that resolves with the command result.
 */
export declare function $(command: string, options?: ExecOptionsCustom): Promise<ExecResult<string>>;
export declare function $(command: string, options: Readonly<{
    encoding: 'buffer' | null;
} & ExecOptions>): Promise<ExecResult<Buffer>>;
export declare function $(command: string, options: Readonly<{
    encoding: BufferEncoding;
} & ExecOptions>): Promise<ExecResult<string>>;
export {};
//# sourceMappingURL=exec-async.d.mts.map