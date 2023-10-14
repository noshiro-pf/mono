// @ts-check

import { exec } from 'child_process';
import { getWorkspaces } from './get-workspaces.mjs';

/**
 * @param {{
 *   prefixes: string[],
 *   command: string,
 *   wsrunOptions: string
 * }} args
 * @returns {Promise<void>}
 */
export const forEachPackages = async ({ prefixes, command, wsrunOptions }) => {
  const workspaces = await getWorkspaces();

  const packageNameList = prefixes.flatMap((prefix) =>
    workspaces
      .filter((ws) => ws.location.startsWith(prefix))
      .map((ws) => ws.name),
  );

  /** @type {string} */
  const fullCommand = [
    'yarn',
    'wsrun',
    wsrunOptions,
    `-p ${packageNameList.join(' ')}`,
    `-c ${command}`,
  ].join(' ');

  console.log(fullCommand);

  const ps = exec(fullCommand);

  ps.stdout?.on('data', (data) => {
    console.log(data);
  });

  ps.stderr?.on('data', (data) => {
    console.error(data);
  });

  ps.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};
