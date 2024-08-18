const mql = window.matchMedia('(max-width: 600px)');

const { useCurrentValue: useIsMobile, setState: setIsMobile } =
  createBooleanState(false);

mql.addEventListener('change', (a) => {
  setIsMobile(a.matches);
});

export { useIsMobile };
