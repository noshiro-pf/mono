import '../node-global.mjs';

/**
 * Checks if a file or directory exists.
 *
 * @param filePath - The path to check.
 * @returns True if the path exists.
 */
const pathExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
};
/**
 * Validates that a path exists and exits with code 1 if it doesn't.
 *
 * @param filePath - The path to validate.
 * @param description - Description for error message (defaults to 'Path').
 */
const assertPathExists = async (filePath, description = 'Path') => {
    if (!(await pathExists(filePath))) {
        echo(`${description} does not exist: ${filePath}`);
        process.exit(1);
    }
};

export { assertPathExists, pathExists };
//# sourceMappingURL=assert-path-exists.mjs.map
