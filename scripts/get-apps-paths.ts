import PackageJson from '../package.json';

const utilsWorkspaces = PackageJson.workspaces.filter((w) =>
  w.startsWith('packages/apps/')
);

for (const u of utilsWorkspaces) {
  console.log(u);
}
