import { type ExecException } from 'node:child_process';
import { Result } from 'ts-data-forge';
import '../node-global.mjs';
/** Get files that have been changed (git status). */
export declare const getUntrackedFiles: (options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
}>) => Promise<Result<readonly string[], ExecException | Readonly<{
    message: string;
}>>>;
/** Get files that differ from the specified base branch or commit */
export declare const getDiffFrom: (base: string, options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
}>) => Promise<Result<readonly string[], ExecException | Readonly<{
    message: string;
}>>>;
//# sourceMappingURL=diff.d.mts.map