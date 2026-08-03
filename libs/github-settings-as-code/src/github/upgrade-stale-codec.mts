import { type Type } from 'ts-fortress';
import { type StrictOmit } from 'ts-type-forge';

/**
 * Restores the full ts-fortress `Type` interface for codecs imported from
 * octokit-safe-types@1.2.19, whose declaration files were generated against
 * ts-fortress 7 (whose `Type` lacked the `prune` member). The pnpm override in
 * `pnpm-workspace.yaml` resolves ts-fortress >= 11 at runtime, so the codec
 * object itself does have `prune`; only its declared type is stale. This
 * verifies `prune` exists at runtime and rebuilds the codec with the correct
 * type, without unsafe type assertions.
 *
 * TODO: Remove this helper once octokit-safe-types is rebuilt against
 * ts-fortress >= 11.
 */
export const upgradeStaleCodec = <A,>(
  codec: Readonly<{ defaultValue: A; prune?: Type<A>['prune'] }> &
    StrictOmit<Type<A>, 'defaultValue' | 'prune'>,
): Type<A> => {
  const { prune } = codec;

  if (prune === undefined) {
    throw new Error(
      `The codec "${codec.typeName}" has no prune function at runtime. octokit-safe-types is probably resolving an old ts-fortress version; check the pnpm overrides.`,
    );
  }

  return { ...codec, prune };
};
