import { type Hsl, type Rgb } from '../../types';

type TestColorObject = Readonly<{
  HEX: string;
  rgb: Rgb;
  hsl: Hsl;
}>;

// [values from google color picker](https://www.google.com/search?q=color+picker&oq=color+picker&aqs=chrome..69i57.1262j0j7&sourceid=chrome&ie=UTF-8)
export const testColors: readonly TestColorObject[] = [
  {
    HEX: '#32a852',
    rgb: [50, 168, 82],
    hsl: [136, 54, 43],
  },
  {
    HEX: '#d9389b',
    rgb: [217, 56, 155],
    hsl: [323, 68, 54],
  },
  {
    HEX: '#e5eb9d',
    rgb: [229, 235, 157],
    hsl: [65, 66, 77],
  },
  {
    HEX: '#49807e',
    rgb: [73, 128, 126],
    hsl: [178, 27, 39],
  },
];

export const epsilon = 3;
