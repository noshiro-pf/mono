import { Percent as P } from '../../types';
import { Alpha } from './alpha';
import { Hue } from './hue';
export declare type Hsl = [Hue, P, P];
export declare const hsl: (h: Hue, s: P, l: P) => Hsl;
export declare type Hsla = [Hsl[0], Hsl[1], Hsl[2], Alpha];
export declare const hsla: (h: Hue, s: P, l: P, a: Alpha) => Hsla;
//# sourceMappingURL=hsl.d.ts.map