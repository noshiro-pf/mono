import * as fs from 'fs';

export const cwd = (): string => fs.realpathSync(process.cwd());
