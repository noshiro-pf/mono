import '../node-global.mjs';
/**
 * Checks if a file or directory exists.
 *
 * @param filePath - The path to check.
 * @returns True if the path exists.
 */
export declare const pathExists: (filePath: string) => Promise<boolean>;
/**
 * Validates that a path exists and exits with code 1 if it doesn't.
 *
 * @param filePath - The path to validate.
 * @param description - Description for error message (defaults to 'Path').
 */
export declare const assertPathExists: (filePath: string, description?: string) => Promise<void>;
//# sourceMappingURL=assert-path-exists.d.mts.map