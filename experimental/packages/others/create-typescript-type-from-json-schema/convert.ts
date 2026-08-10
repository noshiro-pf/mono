import type { JSONSchema4 } from 'json-schema';
import { compile } from 'json-schema-to-typescript';
import 'zx/globals';

const compilerConfig = {
  bannerComment: '',
  format: false,
} as const;

const main = async (typeName: string | undefined): Promise<void> => {
  if (typeName === undefined) {
    throw new Error('typeName is not passed.');
  }

  const schema = await fs.readFile('./src.json', 'utf8');

  const typescriptCode = await compile(
    JSON.parse(schema) as JSONSchema4,
    typeName,
    compilerConfig,
  ).catch((error) => {
    throw new Error(String(error));
  });

  console.log(typescriptCode);
};

main(process.argv[2]).catch(console.error);
