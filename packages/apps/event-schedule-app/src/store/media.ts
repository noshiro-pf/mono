const mql = window.matchMedia('(max-width: 600px)');

const { state: isMobile$, setState: setIsMobile } = createBooleanState(false);

mql.addEventListener('change', (a) => {
  setIsMobile(a.matches);
});

const useIsMobile = (): boolean => useObservableValue(isMobile$);

export { useIsMobile };
