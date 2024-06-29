import { exec } from 'child_process';
import { getWorkspaces } from '../others/index.mjs';

export const forEachPackages = async ({
  prefixes,
  command,
  wsrunOptions,
  treatPrefixesAsExcludeList = false,
}: Readonly<{
  prefixes: readonly string[];
  command: string;
  wsrunOptions: string;
  treatPrefixesAsExcludeList?: boolean;
}>): Promise<void> => {
  const workspaces = await getWorkspaces();

  const packageNameList = prefixes.flatMap((prefix) =>
    workspaces
      .filter(
        (ws) => ws.location.startsWith(prefix) === !treatPrefixesAsExcludeList,
      )
      .map((ws) => ws.name),
  );

  const fullCommand: string = [
    'yarn',
    'wsrun',
    wsrunOptions,
    `-p ${packageNameList.join(' ')}`,
    `-c ${command}`,
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
