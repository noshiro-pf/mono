import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { unknownToString } from 'ts-data-forge';
import { formatFiles, isDirectlyExecuted, Result } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
import { genAgentsMd } from './gen-agents-md.mjs';

/**
 * The single source of truth for the shared agent instructions. Fetched
 * directly from GitHub (no submodule) and vendored into
 * `agents/common-rules.md`.
 */
const commonRulesUrl =
  'https://raw.githubusercontent.com/noshiro-pf/common-agent-config/main/agents/AGENTS.md';

const commonRulesPath = path.resolve(projectRootPath, 'agents/common-rules.md');

/**
 * Fetches the latest shared agent instructions from the common-agent-config
 * repository, vendors them verbatim into `agents/common-rules.md` (the
 * `agents/` directory is excluded from Prettier/markdownlint, so the
 * committed copy stays byte-identical to upstream), and regenerates the
 * root `AGENTS.md`.
 *
 * Requires network access; run via `pnpm run agents:sync` (locally or from
 * the sync-agent-config workflow). The offline counterpart is
 * `pnpm run agents:gen`, which only regenerates `AGENTS.md` from the
 * already-vendored files.
 */
export const syncAgentConfig = async (): Promise<Result<undefined, string>> => {
  try {
    console.log(`Fetching ${commonRulesUrl}...`);

    const response = await fetch(commonRulesUrl);

    if (!response.ok) {
      return Result.err(
        `❌ Failed to fetch ${commonRulesUrl}: ${response.status} ${response.statusText}`,
      );
    }

    const content = await response.text();

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(commonRulesPath, content, 'utf8');

    // Currently a no-op (`agents/` is in .prettierignore, keeping the
    // vendored copy byte-identical to upstream); kept so the copy stays
    // `fmt:full`-stable even if the ignore rules ever change.
    await formatFiles([commonRulesPath]);

    console.log(`Vendored ${path.relative(projectRootPath, commonRulesPath)}.`);

    return await genAgentsMd();
  } catch (error) {
    return Result.err(
      `❌ Failed to sync the agent config: ${unknownToString(error)}`,
    );
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await syncAgentConfig();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
