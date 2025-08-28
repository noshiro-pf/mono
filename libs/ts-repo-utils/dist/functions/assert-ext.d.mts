import '../node-global.mjs';
/** Configuration for directory extension checking. */
export type CheckExtConfig = DeepReadonly<{
    /** Array of directory paths and their expected extensions */
    directories: {
        /** Directory path to check */
        path: string;
        /**
         * Expected file extension(s) (including the dot). Can be a single extension
         * or an array of valid extensions
         */
        extension: `.${string}` | `.${string}`[];
        /**
         * Optional glob patterns to ignore (defaults to ['tsconfig.json',
         * 'globals.d.*'])
         */
        ignorePatterns?: string[];
    }[];
}>;
/**
 * Validates that all files in specified directories have the correct
 * extensions. Exits with code 1 if any files have incorrect extensions.
 *
 * @param config - Configuration specifying directories and expected extensions.
 */
export declare const assertExt: (config: CheckExtConfig) => Promise<void>;
//# sourceMappingURL=assert-ext.d.mts.map