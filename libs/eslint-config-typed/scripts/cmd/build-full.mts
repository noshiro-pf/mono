import 'ts-repo-utils';
import { build } from './build.mjs';

if (isDirectlyExecuted(import.meta.url)) {
  await build(true);
}
