import { expect, test } from '@playwright/test';
import { register, uniqueEmail, username } from './account-steps.mjs';
import {
  answerPageLoadTimeout,
  authCallTimeout,
  emulatorTestTimeout,
  firestoreWriteTimeout,
  functionCallTimeout,
  submitAndOpenAnswerPage,
} from './answer-page-steps.mjs';

// An event list with nothing to show says so in place of the cards, what it
// lists, and each filter that narrowed it. While it hides the events whose
// dates are all past, it offers to show them. A new account lists nothing;
// creating or answering an event is what puts it on one's list. Auth,
// Firestore and a function, so this runs against the emulators.

test(
  'an empty event list says why, and shows the past events it hid',
  { tag: '@emulators' },
  async ({ page, context }) => {
    test.setTimeout(emulatorTestTimeout);

    await register(page, uniqueEmail());

    const listPage = page.getByTestId('event-list-page');

    const empty = listPage.getByTestId('event-list-empty');

    const pastHidden = empty.getByText(
      '候補日程がすべて過去の日程調整は表示していません。',
    );

    const showPast = empty.getByRole('button', {
      name: '過去の日程調整も表示する',
    });

    /* nothing answered yet, past events hidden */

    await page.goto('/event-list/');

    await expect.soft(empty).toBeVisible({ timeout: functionCallTimeout });

    await expect
      .soft(
        empty.getByText(
          'ここには自分が作成または回答した日程調整が表示されます。',
        ),
      )
      .toBeVisible();

    await expect.soft(pastHidden).toBeVisible();

    /* past events shown: still nothing, and nothing more to offer */

    await showPast.click();

    await expect
      .soft(
        listPage.getByRole('checkbox', {
          name: '候補日程が過去日の日程調整も表示',
        }),
      )
      .toBeChecked();

    // The notice and the offer stay until the list read with past events comes
    // back, which says nothing is hidden any more.
    await expect.soft(pastHidden).toBeHidden({ timeout: functionCallTimeout });

    await expect.soft(showPast).toBeHidden();

    await expect.soft(empty).toBeVisible();

    /* a search that matches nothing says so */

    await listPage.getByTestId('search-input').fill('ない言葉');

    await listPage.getByTestId('search-button').click();

    await expect
      .soft(
        empty.getByText(
          'タイトルに「ない言葉」を含む日程調整のみ表示しています。',
        ),
      )
      .toBeVisible({ timeout: functionCallTimeout });

    /* the archive, and only one's own events, say so too */

    await listPage.getByRole('combobox').selectOption('アーカイブ');

    const createdOnly = listPage.getByRole('checkbox', {
      name: '自分が作成した日程調整のみ表示',
    });

    // The filters are disabled while the read the select asked for is out.
    await expect
      .soft(createdOnly)
      .toBeEnabled({ timeout: functionCallTimeout });

    // eslint-disable-next-line playwright/no-force-option -- Blueprint's indicator is what takes the click, as a person's would
    await createdOnly.check({ force: true });

    await expect
      .soft(empty.getByText('アーカイブした日程調整のみ表示しています。'))
      .toBeVisible({ timeout: functionCallTimeout });

    await expect
      .soft(empty.getByText('自分が作成した日程調整のみ表示しています。'))
      .toBeVisible({ timeout: functionCallTimeout });

    /* an event a year ago, answered */

    await page.goto('/');

    const createPage = page.getByTestId('create-page');

    await createPage.getByTestId('title').fill('去年の日程調整');

    // The page starts with today selected; a day of the same month a year
    // earlier takes its place, past whichever day the test runs on.
    await createPage.getByRole('gridcell', { selected: true }).click();

    const today = new Date();

    const lastYear = (today.getFullYear() - 1).toString();

    await createPage
      .getByRole('combobox')
      .filter({
        has: page.getByRole('option', { name: lastYear, exact: true }),
      })
      .selectOption(lastYear);

    await createPage.getByRole('gridcell', { disabled: false }).nth(10).click();

    await expect
      .soft(createPage.getByTestId('selected-datetime-row'))
      .toHaveCount(1);

    const answerPage = await submitAndOpenAnswerPage(page, context);

    // A new tab: Auth restores the user there before the answer form can fill
    // in the name, which makes the answer the account's.
    await expect
      .soft(answerPage.getByTestId('nav-user-menu'))
      .toHaveText(username, { timeout: authCallTimeout });

    const addAnswerButton = answerPage.getByTestId('add-answer-button');

    await expect
      .soft(addAnswerButton)
      .toBeVisible({ timeout: answerPageLoadTimeout });

    await addAnswerButton.click();

    const answerBeingEditedSection = answerPage.getByTestId(
      'answer-being-edited-section',
    );

    await answerBeingEditedSection.getByTestId('col-good-button').click();

    await answerBeingEditedSection
      .getByTestId('buttons')
      .getByTestId('submit-answer-button')
      .click();

    await expect
      .soft(
        answerPage
          .getByTestId('answer-table')
          .getByRole('columnheader', { name: username, exact: true }),
      )
      .toBeVisible({ timeout: firestoreWriteTimeout });

    await answerPage.close();

    /* hidden as past, until shown */

    await page.goto('/event-list/');

    await expect.soft(pastHidden).toBeVisible({ timeout: functionCallTimeout });

    await showPast.click();

    await expect
      .soft(
        listPage
          .getByTestId('event-list-item')
          .filter({ hasText: '去年の日程調整' }),
      )
      .toBeVisible({ timeout: functionCallTimeout });

    await expect.soft(empty).toBeHidden();
  },
);
