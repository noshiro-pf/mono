import '../node-global.mjs';
/**
 * Checks if the repository has uncommitted changes.
 *
 * @returns True if the repo is dirty, false otherwise.
 * @throws Error if git command fails.
 */
export declare const repoIsDirty: (options?: Readonly<{
    silent?: boolean;
}>) => Promise<boolean>;
/**
 * Checks if the repository is clean and exits with code 1 if it is dirty. Shows
 * git status and diff output before exiting.
 */
export declare const assertRepoIsClean: (options?: Readonly<{
    silent?: boolean;
}>) => Promise<void>;
//# sourceMappingURL=assert-repo-is-clean.d.mts.map