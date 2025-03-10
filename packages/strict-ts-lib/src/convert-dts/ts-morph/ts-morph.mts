import { Project } from 'ts-morph';
import { replaceAnyWithUnknown } from './replace-any-with-unknown.mjs';
import { replaceToReadonly } from './replace-to-readonly.mjs';

export const replaceWithTsMorph = async (filepath: string): Promise<void> => {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filepath);

  // if (Math.PI < 0) {
  replaceAnyWithUnknown(sourceFile);
  // }

  // if (filepath.includes('es2015.promise')) {
  if (!filepath.includes('dom') && !filepath.includes('webworker')) {
    replaceToReadonly(sourceFile);
  }

  await sourceFile.save();
};
