import * as React from 'react';
import { Num } from 'ts-data-forge';
import { windowResizeObservable } from '../store/window-resize';

export type RectSize = Readonly<{
  width: number;
  height: number;
}>;

export type PaddingSize = Readonly<{
  top: number;
  right: number;
  bottom: number;
  left: number;
}>;

export type MarginSize = PaddingSize;
export type BorderSize = PaddingSize;

export type ElementSize = Readonly<{
  rect: RectSize;
  padding: PaddingSize;
  margin: MarginSize;
  border: BorderSize;
}>;

type Ret = Readonly<{
  elementSize: ElementSize;
  elementRef: React.RefObject<HTMLDivElement>;
}>;

export const useElementSize = (
  valuesToSubscribeChange: readonly unknown[] = [],
): Ret => {
  const [elementSize, setElementSize] =
    React.useState<ElementSize>(initialValues);

  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // タイミングの問題で非同期に実行しないとサイズが取得できない
    window.setTimeout(() => {
      setElementSize(getElementPaddingsAndMargins(elementRef));
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, valuesToSubscribeChange);

  React.useEffect(() => {
    windowResizeObservable.subscribe(() => {
      setElementSize(getElementPaddingsAndMargins(elementRef));
    });
  }, []);

  return {
    elementSize,
    elementRef,
  };
};

const getElementPaddingsAndMargins = (
  ref: React.RefObject<HTMLElement>,
): ElementSize => {
  if (ref.current === null) {
    return initialValues();
  }

  const wrapperComputedStyle = getComputedStyle(ref.current);

  return {
    rect: {
      width: ref.current.offsetWidth,
      height: ref.current.offsetHeight,
    },
    padding: {
      top: pxStrToNum(wrapperComputedStyle.paddingTop),
      right: pxStrToNum(wrapperComputedStyle.paddingRight),
      bottom: pxStrToNum(wrapperComputedStyle.paddingBottom),
      left: pxStrToNum(wrapperComputedStyle.paddingLeft),
    },
    margin: {
      top: pxStrToNum(wrapperComputedStyle.marginTop),
      right: pxStrToNum(wrapperComputedStyle.marginRight),
      bottom: pxStrToNum(wrapperComputedStyle.marginBottom),
      left: pxStrToNum(wrapperComputedStyle.marginLeft),
    },
    border: {
      top: pxStrToNum(wrapperComputedStyle.borderTopWidth),
      right: pxStrToNum(wrapperComputedStyle.borderRightWidth),
      bottom: pxStrToNum(wrapperComputedStyle.borderBottomWidth),
      left: pxStrToNum(wrapperComputedStyle.borderLeftWidth),
    },
  };
};

const initialValues = (): ElementSize => ({
  rect: { width: 0, height: 0 },
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  border: { top: 0, right: 0, bottom: 0, left: 0 },
});

const pxStrToNum = (s: string): number =>
  Num.mapNaN2Undefined(Number(s.replace('px', ''))) ?? 0;

export const elementSizeToHeight = (es: ElementSize): number =>
  es.rect.height +
  es.padding.top +
  es.padding.bottom +
  es.border.top +
  es.border.bottom;

export const elementSizeToWidth = (es: ElementSize): number =>
  es.rect.width +
  es.padding.left +
  es.padding.right +
  es.border.left +
  es.border.right;
