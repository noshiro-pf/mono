/**
 * Handles a click on a link to a page of this app by pushing its address to the
 * router, so that the page changes without a reload. A modified, middle or
 * already handled click, and a link with a `target`, are left to the browser.
 */
export const routerLinkClick =
  (push: (path: string) => void) =>
  (
    event: MouseEvent & Readonly<{ currentTarget: HTMLAnchorElement }>,
  ): void => {
    const anchor = event.currentTarget;

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      (anchor.target !== '' && anchor.target !== '_self') ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();

    push(anchor.href);
  };
