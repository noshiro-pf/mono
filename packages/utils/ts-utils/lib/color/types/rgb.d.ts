import { Alpha } from './alpha';
import { RgbValue as RgbV } from './rgb-value';
export declare type Rgb = [RgbV, RgbV, RgbV];
export declare const rgb: (r: RgbV, g: RgbV, b: RgbV) => Rgb;
export declare type Rgba = [Rgb[0], Rgb[1], Rgb[2], Alpha];
export declare const rgba: (r: RgbV, g: RgbV, b: RgbV, a: Alpha) => Rgba;
//# sourceMappingURL=rgb.d.ts.map