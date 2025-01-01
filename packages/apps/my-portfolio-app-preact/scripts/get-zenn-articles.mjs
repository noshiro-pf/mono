import * as fs from 'node:fs/promises';
import * as prettier from 'prettier';

fetch('https://zenn.dev/api/articles?username=noshiro_piko&order=latest')
  .then((result) => result.text())
  .then((data) =>
    prettier.format(data, {
      parser: 'json',
    }),
  )
  .then((data) => fs.writeFile('../src/assets/zenn-articles.json', data))
  .catch((error) => {
    console.error(error);
  });
