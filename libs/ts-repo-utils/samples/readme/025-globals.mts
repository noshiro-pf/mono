import 'ts-repo-utils';

// Now these functions are globally available

const result = await $('npm test');

if (Result.isErr(result)) {
  console.error(result.value);
}

echo('Building project...');

const filePath: string = path.join('src', 'index.ts');

const configJson: string = await fs.readFile('./config.json', {
  encoding: 'utf8',
});

const home = os.homedir();

const filesResult = await glob('**/*.ts');

const files: readonly string[] = Result.isOk(filesResult)
  ? filesResult.value
  : ([] as const);

if (isDirectlyExecuted(import.meta.url)) {
  echo('Running as CLI');
}

// embed-sample-code-ignore-below
export { configJson, filePath, files, home };
