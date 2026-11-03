import { expect, test } from '@playwright/test';

test('visit main page', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('input-area')).toBeVisible();
});

test('the output area is read-only', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('input-area')).toBeEditable();

  await expect.soft(page.getByTestId('output-area')).not.toBeEditable();
});

test(
  'the output area can be scrolled to the end of a long reduction',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const outputArea = page.getByTestId('output-area');

    // The term grows with every step and never reaches a normal form, so the
    // output holds every step allowed.
    await page
      .getByTestId('input-area')
      .fill('((lambda x.((x x) x)) (lambda x.((x x) x)))');

    await expect
      .soft(outputArea)
      .toHaveValue(/^100\.\t/mu, { timeout: evaluateAllStepsTimeoutMs });

    // Without overflow the check below would pass with nothing scrolled.
    await expect
      .poll(async () =>
        outputArea.evaluate((el) => el.scrollHeight > el.clientHeight),
      )
      .toBe(true);

    // A light scrollbar would show on the dark background.
    await expect.soft(outputArea).toHaveCSS('color-scheme', 'dark');

    await outputArea.hover();

    await page.mouse.wheel(0, 100_000);

    await expect
      .poll(async () =>
        outputArea.evaluate(
          (el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 1,
        ),
      )
      .toBe(true);
  },
);

// Evaluating all the steps of a growing term takes a few seconds.
const evaluateAllStepsTimeoutMs = 30_000;

const testCases = [
  {
    title: '4 + 5 = 9',
    input: '((+ 4) 5)',
    output: [
      '0.	((+ 4) 5)',
      '1.	((λn.(λs.(λz.((4 s) ((n s) z))))) 5)',
      '2.	(λs.(λz.((4 s) ((5 s) z))))',
      '3.	(λs.(λz.((λz.(s (s (s (s z))))) ((5 s) z))))',
      '4.	(λs.(λz.(s (s (s (s ((5 s) z)))))))',
      '5.	(λs.(λz.(s (s (s (s ((λz.(s (s (s (s (s z)))))) z)))))))',
      '6.	9',
    ],
  },
  {
    title: '0 + 0 = 0',
    input: '((+ 0) 0)',
    output: [
      '0.	((+ 0) 0)',
      '1.	((λn.(λs.(λz.((0 s) ((n s) z))))) 0)',
      '2.	(λs.(λz.((0 s) ((0 s) z))))',
      '3.	(λs.(λz.((λz.z) ((0 s) z))))',
      '4.	(λs.(λz.((0 s) z)))',
      '5.	(λs.(λz.((λz.z) z)))',
      '6.	0',
    ],
  },
  {
    title: '0 + 3 = 3',
    input: '((+ 0) 3)',
    output: [
      '0.	((+ 0) 3)',
      '1.	((λn.(λs.(λz.((0 s) ((n s) z))))) 3)',
      '2.	(λs.(λz.((0 s) ((3 s) z))))',
      '3.	(λs.(λz.((λz.z) ((3 s) z))))',
      '4.	(λs.(λz.((3 s) z)))',
      '5.	(λs.(λz.((λz.(s (s (s z)))) z)))',
      '6.	3',
    ],
  },
  {
    title: '3 + 0 = 3',
    input: '((+ 3) 0)',
    output: [
      '0.	((+ 3) 0)',
      '1.	((λn.(λs.(λz.((3 s) ((n s) z))))) 0)',
      '2.	(λs.(λz.((3 s) ((0 s) z))))',
      '3.	(λs.(λz.((λz.(s (s (s z)))) ((0 s) z))))',
      '4.	(λs.(λz.(s (s (s ((0 s) z))))))',
      '5.	(λs.(λz.(s (s (s ((λz.z) z))))))',
      '6.	3',
    ],
  },
  {
    title: 'parse error',
    input: '((+ 0) 0))',
    output: ['Parse error.'],
  },
] as const satisfies {
  title: string;
  input: string;
  output: readonly string[];
}[];

for (const { title, input, output } of testCases) {
  test(title, { tag: '@smoke' }, async ({ page }) => {
    await page.goto('/');

    const inputArea = page.getByTestId('input-area');

    const outputArea = page.getByTestId('output-area');

    await inputArea.clear();

    await inputArea.fill(input);

    await expect.soft(outputArea).toHaveValue(output.join('\n'));
  });
}
