const acquire = (): { readonly release: () => void } => ({
  release: (): void => {},
});

export const run = (): void => {
  const resource = acquire();

  resource.release();
};
