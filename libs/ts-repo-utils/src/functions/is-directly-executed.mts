import { fileURLToPath } from 'node:url';

export const isDirectlyExecuted = (fileUrl: string): boolean =>
  fileURLToPath(fileUrl) === process.argv[1];
