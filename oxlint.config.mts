// oxlint finds this file by walking up from each package, which is also what
// makes `ignorePatterns` resolve from the repository root. The configuration
// is `tools/configs/oxlint-rules.mts`.
// A moved file or a renamed export still fails when this config loads.
// @ts-expect-error TS5097, the `.mts` extension, which Node.js needs here
import { oxlintConfig } from './tools/configs/oxlint-rules.mts';

export default oxlintConfig;
