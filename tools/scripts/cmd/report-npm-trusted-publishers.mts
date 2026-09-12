import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import * as util from 'node:util';
import {
  Arr,
  isRecord,
  Json,
  Num,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import { type ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Reports the npm trusted publisher configuration of every package, as a table.
 *
 * The packages are the union of two lists:
 *
 * - every non-private workspace member — what `release.yml` publishes, and so
 *   what has to be configured for a release not to fail with `E404`;
 * - every package the npm account can write to (`npm access list packages`),
 *   which also covers packages that do not live in this repository.
 *
 * Each package is looked up with `npm trust list <pkg> --json` rather than by
 * calling `GET /-/package/<pkg>/trust` directly, so that npm does the
 * authentication: the endpoint needs a logged-in account with 2FA, and npm is
 * what knows how to prompt for an OTP or open the web login. The first lookup
 * will usually ask for 2FA; tick "skip two-factor authentication for the next
 * 5 minutes" on the npm website and the rest go through without asking.
 *
 * A workspace package is compared with what `release.yml` presents to npm —
 * {@link expectedConfig}. Anything else is only reported.
 */
export const reportNpmTrustedPublishers = async (
  options: Options,
): Promise<Result<readonly PackageReport[], string>> => {
  const workspacePackages = await readPublishablePackageNames();

  const accountPackages = options.workspaceOnly
    ? Result.ok<readonly string[]>([])
    : await readAccountPackageNames(options.user);

  if (Result.isErr(accountPackages)) return accountPackages;

  const inRepo = new Set(workspacePackages);

  const names = Arr.uniq([...workspacePackages, ...accountPackages.value])
    .filter(
      (name) => options.filter === undefined || name.includes(options.filter),
    )
    .toSorted((a, b) => a.localeCompare(b));

  const inAccount = new Set(accountPackages.value);

  const mut_reports: PackageReport[] = [];

  for (const [index, name] of names.entries()) {
    if (index > 0) await sleep(options.delayMs);

    console.error(`[${index + 1}/${names.length}] ${name}`);

    const report = await inspectPackage(name, {
      inRepo: inRepo.has(name),
      knownPublished: inAccount.has(name),
      otp: options.otp,
    });

    mut_reports.push(report);
  }

  return Result.ok(mut_reports);
};

/**
 * Turns the stdout of `npm trust list <pkg> --json` into trust configurations.
 *
 * npm's JSON output is not a plain serialization of the response. `trust list`
 * hands each configuration to the output layer as an already stringified JSON
 * text, and in `--json` mode that layer keeps only the first non-object item
 * and stringifies it again — so what arrives is a JSON string whose content is
 * the JSON of the first configuration. This accepts that, a plain object and
 * an array alike, so a fix on npm's side does not break it. The registry only
 * allows one configuration per package, so keeping the first loses nothing.
 */
export const parseTrustListOutput = (
  stdout: string,
): Result<readonly TrustConfig[], string> => {
  if (stdout.trim() === '') return Result.ok([]);

  const parsed = Json.parse(stdout);

  if (Result.isErr(parsed)) {
    return Result.err(`Unparsable npm output: ${stdout.trim()}`);
  }

  const value =
    typeof parsed.value === 'string' ? Json.parse(parsed.value) : parsed;

  if (Result.isErr(value)) {
    return Result.err(`Unparsable npm output: ${stdout.trim()}`);
  }

  const items = Arr.isArray(value.value) ? value.value : [value.value];

  const mut_configs: TrustConfig[] = [];

  for (const item of items) {
    if (!isRecord(item)) continue;

    if (isRecord(item['error'])) {
      return Result.err(
        unknownToString(item['error']['summary'] ?? item['error']['code']),
      );
    }

    mut_configs.push(toTrustConfig(item));
  }

  return Result.ok(mut_configs);
};

/** Compares a configuration with {@link expectedConfig}. */
export const diffFromExpected = (config: TrustConfig): readonly string[] =>
  [
    config.type === expectedConfig.type
      ? undefined
      : `provider is ${config.type ?? '(none)'}`,
    config.repository === expectedConfig.repository
      ? undefined
      : `repository is ${config.repository ?? '(none)'}`,
    config.file === expectedConfig.file
      ? undefined
      : `workflow is ${config.file ?? '(none)'}`,
    config.environment === expectedConfig.environment
      ? undefined
      : `environment is ${config.environment ?? '(none)'}`,
    // A configuration made before npm had permissions carries none, and
    // allows publishing.
    config.permissions === undefined ||
    config.permissions.includes(PUBLISH_PERMISSION)
      ? undefined
      : 'publish is not allowed',
  ].filter((d) => d !== undefined);

export const formatReportTable = (
  reports: readonly PackageReport[],
): string => {
  const header = [
    'status',
    'package',
    'in repo',
    'provider',
    'repository',
    'workflow',
    'environment',
    'permissions',
    'note',
  ] as const;

  const rows = reports.map((r) => [
    `${statusIcon[r.status]} ${r.status}`,
    r.name,
    r.inRepo ? 'yes' : 'no',
    r.config?.type ?? '',
    r.config?.repository ?? r.config?.project ?? '',
    r.config?.file ?? '',
    r.config?.environment ?? '',
    r.config?.permissions?.join(', ') ?? '',
    r.note,
  ]);

  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((row) => row[i]?.length ?? 0)),
  );

  const line = (cells: readonly string[]): string =>
    `| ${cells.map((c, i) => c.padEnd(widths[i] ?? 0)).join(' | ')} |`;

  const counts = Object.keys(statusIcon)
    .map((status) => ({
      status,
      count: reports.filter((r) => r.status === status).length,
    }))
    .filter(({ count }) => count > 0)
    .map(({ status, count }) => `${status}: ${count}`)
    .join(', ');

  return [
    line(header),
    line(widths.map((w) => '-'.repeat(w))),
    ...rows.map(line),
    '',
    `${reports.length} package(s) — ${counts}`,
    `expected: ${expectedConfig.type} ${expectedConfig.repository} ${expectedConfig.file} (environment: ${expectedConfig.environment})`,
  ].join('\n');
};

type Options = Readonly<{
  user: string | undefined;
  workspaceOnly: boolean;
  filter: string | undefined;
  otp: string | undefined;
  delayMs: number;
  json: boolean;
  check: boolean;
}>;

type TrustConfig = Readonly<{
  id: string | undefined;
  type: string | undefined;
  repository: string | undefined;
  project: string | undefined;
  file: string | undefined;
  environment: string | undefined;
  permissions: readonly string[] | undefined;
}>;

type Status =
  'ok' | 'mismatch' | 'missing' | 'unpublished' | 'configured' | 'error';

type PackageReport = Readonly<{
  name: string;
  inRepo: boolean;
  status: Status;
  config: TrustConfig | undefined;
  note: string;
}>;

/**
 * What `release.yml` presents to npm. Keep in step with that workflow: the
 * `environment` is the one its `release` job pins, and a trusted publisher
 * without it lets any ref of this repository publish (see the comment there).
 */
const expectedConfig = {
  type: 'github',
  repository: 'noshiro-pf/mono',
  file: 'release.yml',
  environment: 'release',
} as const;

const PUBLISH_PERMISSION = 'createPackage';

const statusIcon = {
  ok: '✅',
  mismatch: '⚠️',
  missing: '❌',
  unpublished: '⏳',
  configured: 'ℹ️',
  error: '💥',
} as const satisfies ReadonlyRecord<Status, string>;

const HELP = [
  'Usage: pnpm run npm-trusted-publishers [options]',
  '',
  'Shows the npm trusted publisher configuration of every package.',
  'Needs `npm login` with 2FA enabled on the account.',
  '',
  'Options:',
  '  --user <name>       npm account whose packages to include (default: npm whoami)',
  '  --workspace-only    only the non-private packages in this repository',
  '  --filter <text>     only packages whose name contains <text>',
  '  --otp <code>        one-time password to pass to npm',
  '  --delay <ms>        wait between registry lookups (default: 1000)',
  '  --json              print JSON instead of a table',
  '  --check             exit 1 when a package in this repository is not "ok"',
  '  -h, --help          show this help',
].join('\n');

const readPublishablePackageNames = async (): Promise<readonly string[]> => {
  const packages = await getWorkspacePackages(projectRootPath);

  return packages
    .filter((pkg) =>
      isRecord(pkg.packageJson) ? pkg.packageJson['private'] !== true : false,
    )
    .map((pkg) => pkg.name);
};

const readAccountPackageNames = async (
  user: string | undefined,
): Promise<Result<readonly string[], string>> => {
  const whoami =
    user === undefined ? await runNpm(['whoami'], undefined) : undefined;

  if (whoami !== undefined && whoami.code !== 0) {
    return Result.err(
      'npm is not logged in. Run `npm login` first, or pass --workspace-only.',
    );
  }

  const account = user ?? whoami?.stdout.trim() ?? '';

  const listed = await runNpm(
    ['access', 'list', 'packages', account, '--json'],
    undefined,
  );

  if (listed.code !== 0) {
    return Result.err(`npm access list packages ${account} failed.`);
  }

  const parsed = Json.parse(listed.stdout);

  if (Result.isErr(parsed) || !isRecord(parsed.value)) {
    return Result.err(`Unparsable npm output: ${listed.stdout.trim()}`);
  }

  return Result.ok(Object.keys(parsed.value));
};

const inspectPackage = async (
  name: string,
  context: Readonly<{
    inRepo: boolean;
    knownPublished: boolean;
    otp: string | undefined;
  }>,
): Promise<PackageReport> => {
  const published = context.knownPublished || (await isPublished(name));

  if (!published) {
    return {
      name,
      inRepo: context.inRepo,
      status: 'unpublished',
      config: undefined,
      note: 'first publish is manual — see libs/first-release.md',
    };
  }

  const result = await runNpm(['trust', 'list', name, '--json'], context.otp);

  const configs = parseTrustListOutput(result.stdout);

  if (Result.isErr(configs) || result.code !== 0) {
    return {
      name,
      inRepo: context.inRepo,
      status: 'error',
      config: undefined,
      note: Result.isErr(configs)
        ? configs.value
        : `npm exited with ${result.code}`,
    };
  }

  const config = configs.value[0];

  if (config === undefined) {
    return {
      name,
      inRepo: context.inRepo,
      status: 'missing',
      config: undefined,
      note: '',
    };
  }

  if (!context.inRepo) {
    return {
      name,
      inRepo: false,
      status: 'configured',
      config,
      note: '',
    };
  }

  const diff = diffFromExpected(config);

  return {
    name,
    inRepo: true,
    status: Arr.isNonEmpty(diff) ? 'mismatch' : 'ok',
    config,
    note: diff.join('; '),
  };
};

const isPublished = async (name: string): Promise<boolean> => {
  const response = await fetch(
    `https://registry.npmjs.org/${name.replace('/', '%2F')}`,
    { method: 'HEAD' },
  );

  return response.ok;
};

/** Mirrors `bodyToOptions` of npm's `trust` providers. */
const toTrustConfig = (item: ReadonlyRecord<string, unknown>): TrustConfig => {
  const { id, type, repository, project, file, environment, permissions } =
    item;

  const claims = isRecord(item['claims']) ? item['claims'] : {};

  const {
    repository: claimRepository,
    project_path: claimProject,
    environment: claimEnvironment,
  } = claims;

  const nested = (key: string, field: string): unknown => {
    const v = claims[key];

    return isRecord(v) ? v[field] : undefined;
  };

  return {
    id: asString(id),
    type: asString(type),
    // The CLI flattens the response, the registry nests it under `claims`.
    repository: asString(repository ?? claimRepository),
    project: asString(project ?? claimProject),
    file: asString(
      file ??
        nested('workflow_ref', 'file') ??
        nested('ci_config_ref_uri', 'file'),
    ),
    environment: asString(environment ?? claimEnvironment),
    permissions: Arr.isArray(permissions)
      ? permissions.filter((p) => typeof p === 'string')
      : undefined,
  };
};

const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  // `pnpm run <script> -- --flag` passes the `--` through.
  const [first, ...rest] = args;

  const argv: readonly string[] = first === '--' ? rest : args;

  const parsed = Result.fromThrowable(() =>
    util.parseArgs({
      args: Array.from(argv),
      options: {
        user: { type: 'string' },
        'workspace-only': { type: 'boolean', default: false },
        filter: { type: 'string' },
        otp: { type: 'string' },
        delay: { type: 'string', default: '1000' },
        json: { type: 'boolean', default: false },
        check: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    }),
  );

  if (Result.isErr(parsed)) return Result.err(unknownToString(parsed.value));

  const { values } = parsed.value;

  if (values.help) return Result.ok('help');

  const delayMs = Result.unwrapOkOr(Num.safeParseInt(values.delay), Number.NaN);

  if (!Number.isFinite(delayMs) || delayMs < 0) {
    return Result.err(
      `--delay must be a non-negative integer: ${values.delay}`,
    );
  }

  return Result.ok({
    user: values.user,
    workspaceOnly: values['workspace-only'],
    filter: values.filter,
    otp: values.otp,
    delayMs,
    json: values.json,
    check: values.check,
  });
};

/**
 * Runs npm with stdin and stderr passed through, so that its OTP prompt and
 * web login URL reach the terminal while stdout is captured.
 */
const runNpm = (
  args: readonly string[],
  otp: string | undefined,
): Promise<Readonly<{ code: number; stdout: string }>> =>
  new Promise((resolve) => {
    const child = spawn(
      'npm',
      [...args, ...(otp === undefined ? [] : [`--otp=${otp}`])],
      { stdio: ['inherit', 'pipe', 'inherit'] },
    );

    const mut_chunks: string[] = [];

    child.stdout.setEncoding('utf8');

    child.stdout.on('data', (chunk: string) => {
      mut_chunks.push(chunk);
    });

    child.on('error', () => {
      resolve({ code: 1, stdout: '' });
    });

    child.on('close', (code) => {
      resolve({
        code: code ?? 1,
        stdout: mut_chunks.join(''),
      });
    });
  });

const asString = (v: unknown): string | undefined =>
  typeof v === 'string' ? v : undefined;

if (isDirectlyExecuted(import.meta.url)) {
  const options = parseOptions(Arr.skip(process.argv, 2));

  if (Result.isErr(options)) {
    console.error(`${options.value}\n\n${HELP}`);

    process.exit(2);
  }

  if (options.value === 'help') {
    console.info(HELP);
  } else {
    const result = await reportNpmTrustedPublishers(options.value);

    if (Result.isErr(result)) {
      console.error(`❌ ${result.value}`);

      process.exit(1);
    }

    console.info(
      options.value.json
        ? JSON.stringify(result.value, undefined, 2)
        : `\n${formatReportTable(result.value)}`,
    );

    if (
      options.value.check &&
      result.value.some((r) => r.inRepo && r.status !== 'ok')
    ) {
      process.exit(1);
    }
  }
}
