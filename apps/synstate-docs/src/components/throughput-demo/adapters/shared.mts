// Smaller spring factor than spring-demo (0.3) because K ticks
// are computed per frame instead of 1.
// At K=100: (1-0.003)^100 ≈ 0.74 → 26% convergence per frame
// At K=500: (1-0.003)^500 ≈ 0.22 → 78% convergence per frame
export const SPRING_FACTOR = 0.003;

export { CANVAS_HEIGHT, CANVAS_WIDTH, lerp } from '../../spring-demo/index.mjs';
