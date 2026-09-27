import {
  effectiveTheme,
  searchWithTheme,
  themeFromSearch,
  toggledTheme,
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

describe(toggledTheme, () => {
  test('from auto, to the opposite of the system', () => {
    expect(toggledTheme('auto', 'light')).toBe('dark');

    expect(toggledTheme('auto', 'dark')).toBe('light');
  });

  test('back to auto when the opposite is what the system shows', () => {
    expect(toggledTheme('dark', 'light')).toBe('auto');

    expect(toggledTheme('light', 'dark')).toBe('auto');
  });

  test('to the other theme when the system already agrees with this one', () => {
    // Reached by typing `?theme=dark` on a dark system, or by the system
    // turning dark while the page was open.
    expect(toggledTheme('dark', 'dark')).toBe('light');

    expect(toggledTheme('light', 'light')).toBe('dark');
  });

  test('every press changes what is on screen', () => {
    for (const system of ['light', 'dark'] as const) {
      for (const theme of ['auto', 'light', 'dark'] as const) {
        expect(effectiveTheme(toggledTheme(theme, system), system)).not.toBe(
          effectiveTheme(theme, system),
        );
      }
    }
  });
});
