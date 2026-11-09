import { expect } from '@playwright/test';
import { test } from './fixtures.mjs';
import {
  addressBar,
  frameOf,
  go,
  openSplitView,
  paneButton,
  panes,
  preset,
  visitCount,
  zoomButton,
} from './helpers.mjs';

test(
  'an empty pane asks for an address and offers no history',
  { tag: '@pane' },
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
  'the address bar opens a page, and back and forward follow it',
  { tag: '@pane' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    const pane = panes(page);

    const home = new URL(pageUrl('/'));

    // Without a scheme, as one types it: a local host gets `http://`.
    await go(pane, home.host);

    await expect
      .soft(frameOf(pane).getByRole('heading', { name: 'home' }))
      .toBeVisible();

    await expect.soft(addressBar(pane)).toHaveValue(pageUrl('/'));

    // The frame reports where a link inside it went.
    await frameOf(pane)
      .getByRole('link', { name: 'to the second page' })
      .click();

    await expect.soft(addressBar(pane)).toHaveValue(pageUrl('second'));

    await paneButton(pane, 'Back').click();

    await expect.soft(addressBar(pane)).toHaveValue(pageUrl('/'));

    await paneButton(pane, 'Forward').click();

    await expect.soft(addressBar(pane)).toHaveValue(pageUrl('second'));
  },
);

test(
  'reload loads the page in the pane again',
  { tag: '@pane' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    const pane = panes(page);

    await go(pane, pageUrl('second'));

    await expect.soft(frameOf(pane).getByText(/^visit \d+$/u)).toBeVisible();

    const first = await visitCount(pane);

    await paneButton(pane, 'Reload').click();

    await expect
      .configure({ soft: true })
      .poll(async () => visitCount(pane))
      .toBe(first + 1);

    // Ctrl+R inside the pane reloads the pane, not the tab.
    await frameOf(pane)
      .getByRole('link', { name: 'back home' })
      .press('Control+r');

    await expect
      .configure({ soft: true })
      .poll(async () => visitCount(pane))
      .toBe(first + 2);

    await expect.soft(addressBar(pane)).toHaveValue(pageUrl('second'));
  },
);

test(
  'a page that refuses to be framed is shown, its title reported',
  { tag: '@pane' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    const pane = panes(page);

    await go(pane, pageUrl('refuses-framing'));

    await expect
      .soft(frameOf(pane).getByRole('heading', { name: 'framed anyway' }))
      .toBeVisible();

    await expect
      .soft(pane.getByTestId('pane-frame'))
      .toHaveAttribute('title', 'Refuses Framing');

    await expect.soft(page).toHaveTitle('1: Refuses Framing');
  },
);

test(
  'a pane request is made to look like a top-level navigation',
  { tag: '@pane' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    await go(panes(page), pageUrl('request-headers'));

    const frame = frameOf(panes(page));

    await expect
      .soft(frame.getByText(/^sec-fetch-dest:/u))
      .toHaveText('sec-fetch-dest: document');

    await expect
      .soft(frame.getByText(/^sec-fetch-mode:/u))
      .toHaveText('sec-fetch-mode: navigate');

    await expect
      .soft(frame.getByText(/^sec-fetch-site:/u))
      .toHaveText('sec-fetch-site: none');
  },
);

test(
  'an address the browser will not frame gets an explanation',
  { tag: '@pane' },
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

    // Nothing to retry: the browser refuses it whatever happens.
    await expect
      .soft(fallback.getByRole('button', { name: 'Try again' }))
      .toHaveCount(0);

    await fallback
      .getByRole('button', { name: 'Show the frame anyway' })
      .click();

    await expect.soft(fallback).toBeHidden();
  },
);

test(
  'a pane zooms in and out, and back to 100%',
  { tag: '@pane' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    const pane = panes(page);

    const zoom = zoomButton(pane);

    // At 100% there is no level to show.
    await expect.soft(zoom).toBeHidden();

    await paneButton(pane, 'Zoom in').click();

    await expect.soft(zoom).toHaveText('110%');

    await paneButton(pane, 'Zoom out').click();

    await paneButton(pane, 'Zoom out').click();

    await expect.soft(zoom).toHaveText('90%');

    await zoom.click();

    await expect.soft(zoom).toBeHidden();
  },
);

test(
  'the sandbox toggles, and the pane loads again under the new one',
  { tag: '@pane' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    const pane = panes(page);

    await go(pane, pageUrl('second'));

    const frame = pane.getByTestId('pane-frame');

    await expect.soft(frame).toHaveAttribute('sandbox', /allow-scripts/u);

    await expect.soft(frameOf(pane).getByText(/^visit \d+$/u)).toBeVisible();

    const before = await visitCount(pane);

    await pane.getByRole('button', { name: /^Turn the sandbox off/u }).click();

    await expect.soft(frame).not.toHaveAttribute('sandbox');

    await expect
      .configure({ soft: true })
      .poll(async () => visitCount(pane))
      .toBe(before + 1);

    await expect.soft(page).toHaveURL(/[?&]sandbox=0/u);
  },
);

test(
  'a narrow pane keeps its rarer buttons in its menu',
  { tag: '@pane' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    // Three columns make each pane narrower than its toolbar.
    await preset(page, '3 cols').click();

    const pane = panes(page).first();

    await expect.soft(paneButton(pane, 'Split to the right')).toHaveCount(0);

    const more = paneButton(pane, 'More for this pane');

    await more.click();

    await expect.soft(more).toHaveAttribute('aria-expanded', 'true');

    const menu = pane.getByRole('menu');

    await expect.soft(paneButton(menu, 'Zoom in')).toBeVisible();

    // Just below the toolbar: both are placed by `--sv-bar-height`.
    const menuBox = await menu.boundingBox();

    const barBox = await pane.getByTestId('pane-bar').boundingBox();

    expect.soft(menuBox?.y).toBe((barBox?.y ?? 0) + (barBox?.height ?? 0));

    await menu.getByRole('menuitem', { name: 'Split to the right' }).click();

    await expect.soft(panes(page)).toHaveCount(4);

    await expect.soft(menu).toBeHidden();
  },
);
