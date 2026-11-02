import { expect } from '@playwright/test';
import { Num, Result } from 'ts-data-forge';
import { test } from './fixtures.mjs';
import {
  addressBar,
  frameOf,
  go,
  openSplitView,
  paneButton,
  panes,
  preset,
  zoomButton,
} from './helpers.mjs';

test(
  'an empty pane asks for an address and offers no history',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    const pane = panes(page);

    await expect
      .soft(pane.getByText('Type an address in the bar above'))
      .toBeVisible();

    await expect.soft(paneButton(pane, 'Back')).toBeDisabled();

    await expect.soft(paneButton(pane, 'Forward')).toBeDisabled();

    await expect.soft(paneButton(pane, 'Reload')).toBeDisabled();
  },
);

test(
  "a pane's address bar opens a page, and back and forward follow its history",
  { tag: '@smoke' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    const pane = panes(page);

    const home = new URL(pageUrl('/'));

    // Without a scheme, as one types it.
    await go(pane, home.host);

    await expect
      .soft(frameOf(pane).getByRole('heading', { name: 'home' }))
      .toBeVisible();

    await expect.soft(addressBar(pane)).toHaveValue(pageUrl('/'));

    // A link followed inside the page moves the address bar along.
    await frameOf(pane)
      .getByRole('link', { name: 'to the second page' })
      .click();

    await expect
      .soft(frameOf(pane).getByRole('heading', { name: 'second' }))
      .toBeVisible();

    await expect.soft(addressBar(pane)).toHaveValue(pageUrl('second'));

    await paneButton(pane, 'Back').click();

    await expect
      .soft(frameOf(pane).getByRole('heading', { name: 'home' }))
      .toBeVisible();

    await expect.soft(addressBar(pane)).toHaveValue(pageUrl('/'));

    await paneButton(pane, 'Forward').click();

    await expect
      .soft(frameOf(pane).getByRole('heading', { name: 'second' }))
      .toBeVisible();

    await expect.soft(addressBar(pane)).toHaveValue(pageUrl('second'));
  },
);

test(
  'reload loads the page in the pane again',
  { tag: '@smoke' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    const pane = panes(page);

    await go(pane, pageUrl('second'));

    // The server counts the visits, the only thing a reload changes here.
    const visit = frameOf(pane).getByText(/^visit \d+$/u);

    const before = visitNumber(await visit.innerText());

    await paneButton(pane, 'Reload').click();

    await expect.soft(visit).toHaveText(`visit ${(before + 1).toString()}`);

    await expect.soft(addressBar(pane)).toHaveValue(pageUrl('second'));
  },
);

test(
  'a page that refuses to be framed is shown anyway',
  { tag: '@smoke' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    const pane = panes(page);

    await go(pane, pageUrl('refuses-framing'));

    await expect
      .soft(frameOf(pane).getByRole('heading', { name: 'framed anyway' }))
      .toBeVisible();

    // The page's title comes back from inside the frame.
    await expect
      .soft(pane.getByTestId('pane-frame'))
      .toHaveAttribute('title', 'Refuses Framing');

    await expect.soft(page).toHaveTitle(/Refuses Framing$/u);
  },
);

test(
  'an address the browser will not show in a frame gets an explanation',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    const pane = panes(page);

    await go(pane, 'file:///etc/hostname');

    const fallback = pane.getByTestId('pane-fallback');

    await expect
      .soft(fallback)
      .toContainText('This page cannot be shown in a pane');

    await expect
      .soft(fallback.getByRole('button', { name: 'Open in a new tab' }))
      .toBeVisible();

    await fallback
      .getByRole('button', { name: 'Show the frame anyway' })
      .click();

    await expect.soft(fallback).toBeHidden();
  },
);

test(
  'a pane zooms in and out, and back to 100%',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    const pane = panes(page);

    const zoom = zoomButton(pane);

    await expect.soft(zoom).toHaveText('100%');

    await paneButton(pane, 'Zoom in').click();

    await expect.soft(zoom).toHaveText('110%');

    await paneButton(pane, 'Zoom out').click();

    await paneButton(pane, 'Zoom out').click();

    await expect.soft(zoom).toHaveText('90%');

    await zoom.click();

    await expect.soft(zoom).toHaveText('100%');
  },
);

test(
  'a narrow pane keeps its rarer buttons in its menu',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    // Three columns make each pane narrower than its toolbar.
    await preset(page, '3 cols').click();

    const pane = panes(page).first();

    await expect.soft(paneButton(pane, 'Split to the right')).toHaveCount(0);

    const more = paneButton(pane, 'More for this pane');

    await more.click();

    await expect.soft(more).toHaveAttribute('aria-expanded', 'true');

    const menu = pane.getByTestId('pane-menu');

    await expect.soft(paneButton(menu, 'Zoom in')).toBeVisible();

    await paneButton(menu, 'Split to the right').click();

    await expect.soft(panes(page)).toHaveCount(4);

    // Choosing an item closes the menu.
    await expect.soft(menu).toBeHidden();
  },
);

const visitNumber = (text: string): number => {
  const visits = Num.safeParseFloat(text.replace(/^visit /u, ''));

  if (Result.isErr(visits)) {
    throw new Error(`Not a visit count: "${text}"`);
  }

  return visits.value;
};
