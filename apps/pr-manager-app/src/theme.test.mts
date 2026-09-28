import {
  chosenTheme,
  effectiveTheme,
  searchWithTheme,
  themeFromSearch,
} from './theme.mjs';

describe(themeFromSearch, () => {
  test('reads light and dark', () => {
    expect(themeFromSearch('?theme=light')).toBe('light');

    expect(themeFromSearch('?theme=dark')).toBe('dark');
  });

  test('is auto without the parameter, or with one it does not know', () => {
    expect(themeFromSearch('')).toBe('auto');

    expect(themeFromSearch('?other=1')).toBe('auto');

    expect(themeFromSearch('?theme=sepia')).toBe('auto');

    expect(themeFromSearch('?theme=Dark')).toBe('auto');
  });
});

describe(searchWithTheme, () => {
  test('writes the theme', () => {
    expect(searchWithTheme('', 'dark')).toBe('?theme=dark');

    expect(searchWithTheme('?theme=dark', 'light')).toBe('?theme=light');
  });

  test('writes auto as the absence of the parameter', () => {
    expect(searchWithTheme('?theme=dark', 'auto')).toBe('');

    expect(searchWithTheme('', 'auto')).toBe('');
  });

  test('keeps the other parameters where they were', () => {
    expect(searchWithTheme('?a=1&theme=dark&b=2', 'light')).toBe(
      '?a=1&theme=light&b=2',
    );

    expect(searchWithTheme('?a=1&theme=dark', 'auto')).toBe('?a=1');

    expect(searchWithTheme('?a=1', 'dark')).toBe('?a=1&theme=dark');
  });
});

describe(effectiveTheme, () => {
  test('auto is what the system prefers', () => {
    expect(effectiveTheme('auto', 'dark')).toBe('dark');

    expect(effectiveTheme('auto', 'light')).toBe('light');
  });

  test('a chosen theme wins over the system', () => {
    expect(effectiveTheme('light', 'dark')).toBe('light');

    expect(effectiveTheme('dark', 'light')).toBe('dark');
  });
});

describe(chosenTheme, () => {
  test('the other look than the system is kept as a choice', () => {
    expect(chosenTheme('dark', 'light')).toBe('dark');

    expect(chosenTheme('light', 'dark')).toBe('light');
  });

  test('the look the system shows is no choice at all', () => {
    expect(chosenTheme('light', 'light')).toBe('auto');

    expect(chosenTheme('dark', 'dark')).toBe('auto');
  });

  test('what is on screen is always the look picked', () => {
    for (const system of ['light', 'dark'] as const) {
      for (const picked of ['light', 'dark'] as const) {
        expect(effectiveTheme(chosenTheme(picked, system), system)).toBe(
          picked,
        );
      }
    }
  });
});
