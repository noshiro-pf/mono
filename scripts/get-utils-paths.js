'use strict';

// @ts-check

const PackageJson = require('../package.json');

const utilsWorkspaces = PackageJson.workspaces.filter((w) =>
  w.startsWith('packages/utils/')
);

for (const u of utilsWorkspaces) {
  console.log(u);
}
