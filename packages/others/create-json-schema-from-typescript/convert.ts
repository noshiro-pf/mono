import path from 'path';
import type { CompilerOptions, PartialArgs } from 'typescript-json-schema';
import { generateSchema, getProgramFromFiles } from 'typescript-json-schema';

// optionally pass argument to schema generator
const settings: PartialArgs = {
  required: true,
  aliasRef: true,
};

// optionally pass ts compiler options
const compilerOptions: CompilerOptions = {
  strictNullChecks: true,
  noUncheckedIndexedAccess: true,
  strict: true,
  skipLibCheck: true,
};

// optionally pass a base path
const basePath = './';

const main = (typeName: string | undefined): void => {
  if (typeName === undefined) {
    throw new Error('typeName is not passed.');
  }

  const program = getProgramFromFiles(
    [path.resolve('src.ts')],
    compilerOptions,
    basePath
  );

  const schema = generateSchema(program, typeName, settings);

  console.log(JSON.stringify(schema, null, 2));
};

main(process.argv[2]);
