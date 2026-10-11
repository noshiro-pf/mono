import * as path from 'node:path';
import { listDownloadFiles } from './download-list.mjs';

const dir = path.resolve('/archive/general/2024-01-01');

describe(listDownloadFiles, () => {
  test('lists a files.slack.com URL with a known extension', () => {
    assert.deepStrictEqual(
      listDownloadFiles(
        {
          files: [
            {
              url_private:
                'https://files.slack.com/files-pri/T0/F0/image.png?t=xoxe-0',
            },
          ],
        },
        dir,
      ),
      [
        {
          url: 'https://files.slack.com/files-pri/T0/F0/image.png?t=xoxe-0',
          outputFilePath: path.resolve(dir, 'files', '0', 'url_private.png'),
        },
      ],
    );
  });

  test('skips a URL whose host only starts with files.slack.com', () => {
    assert.deepStrictEqual(
      listDownloadFiles(
        { url_private: 'https://files.slack.com.example.org/a/image.png?t=0' },
        dir,
      ),
      [],
    );
  });

  test('skips a URL that is not https', () => {
    assert.deepStrictEqual(
      listDownloadFiles(
        { url_private: 'http://files.slack.com/a/image.png?t=0' },
        dir,
      ),
      [],
    );
  });

  test('lists the URL in its normalized form', () => {
    assert.deepStrictEqual(
      listDownloadFiles({ title: 'https://files.slack.com/a b;c.png?' }, dir),
      [
        {
          url: 'https://files.slack.com/a%20b;c.png?',
          outputFilePath: path.resolve(dir, 'title.png'),
        },
      ],
    );
  });

  test('skips an entry whose key would place the file outside the directory', () => {
    assert.deepStrictEqual(
      listDownloadFiles(
        {
          '../../../outside': 'https://files.slack.com/a/image.png?t=0',
          '/absolute': 'https://files.slack.com/a/image.png?t=0',
        },
        dir,
      ),
      [],
    );
  });
});
