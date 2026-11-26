/**
 * The documentation URL to print for a rule: `url` as the plugin's
 * `meta.docs.url` gives it, unless that URL is known not to resolve.
 */
export const fixDocsUrl = (
  pluginName: string,
  ruleName: string,
  url: string | undefined,
): string | undefined => brokenDocsUrls.get(`${pluginName}/${ruleName}`) ?? url;

// Each entry replaces a URL the plugin publishes that leads nowhere.
const brokenDocsUrls: ReadonlyMap<string, string> = new Map<string, string>([
  [
    // The plugin builds the URL as `https://github.com/JamieMason/${name}`,
    // naming a repository that does not exist.
    'eslint-plugin-prefer-arrow-functions/prefer-arrow-functions',
    'https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions',
  ],
]);

if (import.meta.vitest !== undefined) {
  describe(fixDocsUrl, () => {
    test('replaces the URL eslint-plugin-prefer-arrow-functions publishes', () => {
      expect(
        fixDocsUrl(
          'eslint-plugin-prefer-arrow-functions',
          'prefer-arrow-functions',
          'https://github.com/JamieMason/prefer-arrow-functions',
        ),
      ).toBe(
        'https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions',
      );
    });

    test('keeps the URL of any other rule', () => {
      expect(
        fixDocsUrl(
          'eslint-plugin-unicorn',
          'prefer-arrow-functions',
          'https://example.com/a',
        ),
      ).toBe('https://example.com/a');

      expect(
        fixDocsUrl('eslint-plugin-unicorn', 'no-for-loop', undefined),
      ).toBeUndefined();
    });
  });
}
