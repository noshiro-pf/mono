import { RectSize } from './rect-size';
export declare type Rect = RectSize & Readonly<{
    top: number;
    left: number;
}>;
export declare const defaultRect: Rect;
export declare const rectSizeToRect: (rectsize: RectSize) => Rect;
export declare const bottom: (r: Rect) => number;
export declare const right: (r: Rect) => number;
//# sourceMappingURL=rectangle.d.ts.map