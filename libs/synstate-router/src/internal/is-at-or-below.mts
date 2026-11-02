/** Whether the page `route` is the node `id` or one of its descendants. */
export const isAtOrBelow = (route: string | undefined, id: string): boolean =>
  route !== undefined && (route === id || route.startsWith(`${id}.`));
