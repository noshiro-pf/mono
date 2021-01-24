import { organizeImportsAndRunPrettierWithIO } from './format_base';

const globPattern = process.argv[2]; // like './src/**/*.{ts,tsx}'

if (globPattern !== undefined) {
  organizeImportsAndRunPrettierWithIO([globPattern]).catch((err) =>
    console.error(err)
  );
}
