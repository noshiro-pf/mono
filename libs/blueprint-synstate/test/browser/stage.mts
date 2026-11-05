// cspell:ignore unhover
// The stage both sides of a comparison are mounted on, for what is drawn in a
// portal, or opened by the pointer, and so is compared outside
// `blueprint-cases.tsx`.
import { page, userEvent } from 'vitest/browser';
import { settle, transitioned } from './helpers.mjs';
import { linesOf } from './markup-lines.mjs';

/** A fixed stage in the middle of the page, so that both sides place alike. */
export const stage = (): HTMLElement => {
  const host = document.createElement('div');

  host.style.setProperty('display', 'flex');

  host.style.setProperty('align-items', 'center');

  host.style.setProperty('justify-content', 'center');

  host.style.setProperty('width', '480px');

  host.style.setProperty('height', '360px');

  document.body.append(host);

  return host;
};

/**
 * Mounts a side on the stage, brings it to the state compared, and reads the
 * markup of the stage and of every portal it draws in.
 */
export const linesAfter = async (
  mount: (on: HTMLElement) => () => void,
  open: (on: HTMLElement) => Promise<void>,
): Promise<readonly string[]> => {
  const host = stage();

  const unmount = mount(host);

  try {
    await open(host);

    await settle();

    const portals = document.createElement('div');

    for (const portal of document.querySelectorAll('.bp6-portal')) {
      portals.append(portal.cloneNode(true));
    }

    return [...linesOf(host), '--- portals', ...linesOf(portals)];
  } finally {
    unmount();

    host.remove();

    await userEvent.unhover(document.body);

    await transitioned();
  }
};

/** As {@link linesAfter}, a picture of the stage, as base64 PNG. */
export const shotAfter = async (
  mount: (on: HTMLElement) => () => void,
  open: (on: HTMLElement) => Promise<void>,
): Promise<string> => {
  const host = stage();

  const unmount = mount(host);

  try {
    await open(host);

    return await page.screenshot({ element: host, save: false });
  } finally {
    unmount();

    host.remove();

    await userEvent.unhover(document.body);

    await transitioned();
  }
};
