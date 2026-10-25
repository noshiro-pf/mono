/**
 * Whether the URL asks for the in-memory demo (`?storage=memory`), which
 * skips sign-in and keeps everything in the tab.
 *
 * Only half of the decision: `main.tsx` also requires `import.meta.env.DEV`,
 * which a production build replaces with `false`, so the demo — and its
 * sample data — is not even in the bundle that is published.
 */
export const isMemoryStorageRequested = (search: string): boolean => {
  const params = new URLSearchParams(search);

  return params.get('storage') === 'memory';
};
