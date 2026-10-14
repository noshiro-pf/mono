// oxlint finds this file by walking up from each package, which is also what
// makes `ignorePatterns` resolve from the repository root. The configuration
// is `tools/configs/oxlint-rules.mts`.
import { oxlintConfig } from './tools/configs/oxlint-rules.mts';

export default oxlintConfig;
