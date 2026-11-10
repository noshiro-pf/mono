/**
 * Node's `fetch` goes through `HTTPS_PROXY` only when told to
 * (`spec/commands.md`, "Proxy"); without it a request behind a proxy fails as
 * `401 Bad credentials`, which reads as a token problem. A command builds its
 * transport with {@link proxiedFetchTransport} rather than `fetchTransport`, so
 * that a Node of 25.4 or later is told; an older one must be started told.
 */

import type { Transport } from 'pr-report-core-v2';
import { Result, unknownToString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { fetchTransport } from './fetch-transport.mjs';

/**
 * The transport every command reads and writes through: `fetch`, once told to
 * use the environment's proxy.
 */
export const proxiedFetchTransport = (
  env: ReadonlyRecord<string, string | undefined>,
  node: NodeProxySupport,
  fetchFn: typeof fetch,
): Result<Transport, string> =>
  Result.map(useEnvProxy(env, node), () => fetchTransport(fetchFn));

/**
 * Tells `fetch` to use the environment's proxy through
 * `http.setGlobalProxyFromEnv`, where Node has it (25.4 and later); a proxy URL
 * that does not parse is the error.
 */
export const useEnvProxy = (
  env: ReadonlyRecord<string, string | undefined>,
  node: NodeProxySupport,
): Result<undefined, string> => {
  const set = node.setGlobalProxyFromEnv;

  // An older Node is told only from outside, by `NODE_USE_ENV_PROXY=1`, which a
  // root script running the command is to set. Whether it was cannot be read back, and telling from
  // the environment means copying Node's rules (which variables, which flags,
  // `NO_PROXY`), which a copy gets wrong; so nothing is guessed here.
  if (set === undefined) {
    return Result.ok(undefined);
  }

  return Result.mapErr(
    Result.fromThrowable(() => {
      set(env);

      return undefined;
    }),
    (error) => `cannot use the proxy: ${unknownToString(error)}`,
  );
};

/** What a command reads of the running Node to tell `fetch` of the proxy. */
export type NodeProxySupport = Readonly<{
  /** `http.setGlobalProxyFromEnv`, where Node has it. */
  setGlobalProxyFromEnv:
    | ((proxyEnv: ReadonlyRecord<string, string | undefined>) => unknown)
    | undefined;
}>;
