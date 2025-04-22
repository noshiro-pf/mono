#!/usr/bin/env node
"use strict";

const path = require('path');
const tsm = require('ts-morph');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

// definitions

const optionDefinitions = [
  {
    name: 'src',
    type: String,
    description:
      'Glob pattern that specifies the format target (absolute or relative)',
  },
  { name: 'silent', alias: 's', type: Boolean, defaultValue: false },
  { name: 'help', alias: 'h', type: Boolean, description: 'show help' },
];

function organizeImports(globPattern, silent) {
  const project = new tsm.Project();

  project.addSourceFilesAtPaths(globPattern);

  const sourceFiles = project.getSourceFiles();

  sourceFiles.forEach((sourceFile) => {
    if (!silent) {
      console.log(sourceFile.getFilePath());
    }
    sourceFile.organizeImports();
  });
  project.saveSync();
}

// main

const options = commandLineArgs(optionDefinitions);

if (options.help) {
  const sections = [
    {
      header: 'ts-organize-imports',
      content: 'organize imports of TypeScript source files',
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
  ];

  const usage = commandLineUsage(sections);
  console.log(usage);
  process.exit(0);
}

const pathInput = options.src;
const fullPath = pathInput.startsWith('/')
  ? pathInput
  : path.resolve(process.cwd(), pathInput);

console.log(`target files: ${fullPath}`);
console.log('');
organizeImports(fullPath, options.silent);
console.log('');
