import { createBooleanState } from 'synstate-react-hooks';

const mql = matchMedia('(max-width: 600px)');

const [useIsMobile, { setState: setIsMobile }] = createBooleanState(false);

mql.addEventListener('change', (a) => {
  setIsMobile(a.matches);
});

export { useIsMobile };
