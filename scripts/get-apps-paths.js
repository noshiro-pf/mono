'use strict';

// @ts-check

const PackageJson = require('../package.json');

const appsWorkspaces = PackageJson.workspaces.filter((w) =>
  w.startsWith('packages/apps/')
);

for (const u of appsWorkspaces) {
  console.log(u);
}
