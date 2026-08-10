import { exec } from 'child_process';
import { getWorkspaces } from './get-workspaces.mjs';

export const forEachPackages = async ({
  prefixes,
  command,
  pnpmOptions,
  treatPrefixesAsExcludeList = false,
}: Readonly<{
  prefixes: readonly string[];
  command: string;
  pnpmOptions: string;
  treatPrefixesAsExcludeList?: boolean;
}>): Promise<void> => {
  const workspaces = await getWorkspaces();

  const packageNameList = workspaces
    .filter((ws) =>
      treatPrefixesAsExcludeList
        ? prefixes.every((prefix) => !ws.location.startsWith(prefix))
        : prefixes.some((prefix) => ws.location.startsWith(prefix)),
    )
    .map((ws) => ws.name);

  {
    console.log('');
    for (const packageName of packageNameList) {
      console.log('-', packageName);
    }
    console.log('');
  }

  const fullCommand: string = [
    'pnpm',
    packageNameList.map((packageName) => `--filter ${packageName}`).join(' '),
    pnpmOptions,
    'run',
    command,
  ].join(' ');

  console.log(fullCommand);

  // eslint-disable-next-line security/detect-child-process
  const ps = exec(fullCommand);

  ps.stdout?.on('data', (data) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    process.stdout.write(data);
  });

  ps.stderr?.on('data', (data) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    process.stderr.write(data);
  });

  ps.on('close', (code) => {
    process.stdout.write(`child process exited with code ${code}`);
  });
};
