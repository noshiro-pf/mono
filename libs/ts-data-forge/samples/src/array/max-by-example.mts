// Example: src/array/array-utils.mts (maxBy)
import { Arr, Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const projects = [
  { id: 'a', stars: 10 },
  { id: 'b', stars: 30 },
  { id: 'c', stars: 20 },
];

const mostStars = Arr.maxBy(projects, (project) => project.stars);

const smallestStars = Arr.maxBy(
  projects,
  (project) => project.stars,
  (a, b) => b - a,
);

assert.deepStrictEqual(mostStars, Optional.some({ id: 'b', stars: 30 }));

assert.deepStrictEqual(smallestStars, Optional.some({ id: 'a', stars: 10 }));
