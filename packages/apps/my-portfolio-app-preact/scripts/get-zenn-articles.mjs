import { toThisDir } from '@noshiro/mono-utils';
import * as prettier from 'prettier';
import 'zx/globals';

const thisDir = toThisDir(import.meta.url);

fetch('https://zenn.dev/api/articles?username=noshiro_piko&order=latest')
  .then((result) => result.text())
  .then((data) =>
    prettier.format(data, {
      parser: 'json',
    }),
  )
  .then((data) =>
    fs.writeFile(
      path.resolve(thisDir, '../src/assets/zenn-articles.json'),
      data,
    ),
  )
  .catch((error) => {
    console.error(error);
  });
