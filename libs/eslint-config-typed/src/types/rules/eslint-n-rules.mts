/* cSpell:disable */
import { type Linter } from 'eslint';

namespace CallbackReturn {
  export type RuleEntry = Linter.StringSeverity;
}

namespace ExportsStyle {
  export type RuleEntry = Linter.StringSeverity;
}

namespace FileExtensionInImport {
  export type RuleEntry = Linter.StringSeverity;
}

namespace GlobalRequire {
  export type RuleEntry = Linter.StringSeverity;
}

namespace HandleCallbackErr {
  export type RuleEntry = Linter.StringSeverity;
}

namespace Hashbang {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoCallbackLiteral {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoDeprecatedApi {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoExportsAssign {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoExtraneousImport {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoExtraneousRequire {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoMissingImport {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoMissingRequire {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoMixedRequires {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoNewRequire {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoPathConcat {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoProcessEnv {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoProcessExit {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoRestrictedImport {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoRestrictedRequire {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoSync {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoTopLevelAwait {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoUnpublishedBin {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoUnpublishedImport {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoUnpublishedRequire {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoUnsupportedFeaturesEsBuiltins {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoUnsupportedFeaturesEsSyntax {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoUnsupportedFeaturesNodeBuiltins {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferGlobalBuffer {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferGlobalConsole {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferGlobalProcess {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferGlobalTextDecoder {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferGlobalTextEncoder {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferGlobalUrlSearchParams {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferGlobalUrl {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferNodeProtocol {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferPromisesDns {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferPromisesFs {
  export type RuleEntry = Linter.StringSeverity;
}

namespace ProcessExitAsThrow {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintNRules = {
  readonly 'n/callback-return': CallbackReturn.RuleEntry;
  readonly 'n/exports-style': ExportsStyle.RuleEntry;
  readonly 'n/file-extension-in-import': FileExtensionInImport.RuleEntry;
  readonly 'n/global-require': GlobalRequire.RuleEntry;
  readonly 'n/handle-callback-err': HandleCallbackErr.RuleEntry;
  readonly 'n/hashbang': Hashbang.RuleEntry;
  readonly 'n/no-callback-literal': NoCallbackLiteral.RuleEntry;
  readonly 'n/no-deprecated-api': NoDeprecatedApi.RuleEntry;
  readonly 'n/no-exports-assign': NoExportsAssign.RuleEntry;
  readonly 'n/no-extraneous-import': NoExtraneousImport.RuleEntry;
  readonly 'n/no-extraneous-require': NoExtraneousRequire.RuleEntry;
  readonly 'n/no-missing-import': NoMissingImport.RuleEntry;
  readonly 'n/no-missing-require': NoMissingRequire.RuleEntry;
  readonly 'n/no-mixed-requires': NoMixedRequires.RuleEntry;
  readonly 'n/no-new-require': NoNewRequire.RuleEntry;
  readonly 'n/no-path-concat': NoPathConcat.RuleEntry;
  readonly 'n/no-process-env': NoProcessEnv.RuleEntry;
  readonly 'n/no-process-exit': NoProcessExit.RuleEntry;
  readonly 'n/no-restricted-import': NoRestrictedImport.RuleEntry;
  readonly 'n/no-restricted-require': NoRestrictedRequire.RuleEntry;
  readonly 'n/no-sync': NoSync.RuleEntry;
  readonly 'n/no-top-level-await': NoTopLevelAwait.RuleEntry;
  readonly 'n/no-unpublished-bin': NoUnpublishedBin.RuleEntry;
  readonly 'n/no-unpublished-import': NoUnpublishedImport.RuleEntry;
  readonly 'n/no-unpublished-require': NoUnpublishedRequire.RuleEntry;
  readonly 'n/no-unsupported-features/es-builtins': NoUnsupportedFeaturesEsBuiltins.RuleEntry;
  readonly 'n/no-unsupported-features/es-syntax': NoUnsupportedFeaturesEsSyntax.RuleEntry;
  readonly 'n/no-unsupported-features/node-builtins': NoUnsupportedFeaturesNodeBuiltins.RuleEntry;
  readonly 'n/prefer-global/buffer': PreferGlobalBuffer.RuleEntry;
  readonly 'n/prefer-global/console': PreferGlobalConsole.RuleEntry;
  readonly 'n/prefer-global/process': PreferGlobalProcess.RuleEntry;
  readonly 'n/prefer-global/text-decoder': PreferGlobalTextDecoder.RuleEntry;
  readonly 'n/prefer-global/text-encoder': PreferGlobalTextEncoder.RuleEntry;
  readonly 'n/prefer-global/url-search-params': PreferGlobalUrlSearchParams.RuleEntry;
  readonly 'n/prefer-global/url': PreferGlobalUrl.RuleEntry;
  readonly 'n/prefer-node-protocol': PreferNodeProtocol.RuleEntry;
  readonly 'n/prefer-promises/dns': PreferPromisesDns.RuleEntry;
  readonly 'n/prefer-promises/fs': PreferPromisesFs.RuleEntry;
  readonly 'n/process-exit-as-throw': ProcessExitAsThrow.RuleEntry;
};
