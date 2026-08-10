import { useValueAsRef } from '@noshiro/react-utils';
import { Num, noop, pipe, toNonZeroFiniteNumber } from '@noshiro/ts-utils';
import { useState } from 'better-react-use-state';
import { useCallback, useEffect, useMemo, useRef } from 'react';

type Props = Readonly<{
  trackElementRef: React.RefObject<HTMLDivElement>;
  disabled: boolean;
  stepSize: number;
  min: number;
  max: number;
  value: number;
  labelFractionDigits: UintRange<0, 21>;
  onChange: (value: number) => void;
  onRelease: (value: number) => void;
}>;

export type SliderHandleElementAdaptor = Readonly<{
  handleElementRef: React.RefObject<HTMLSpanElement>;
  beginHandleMovement: React.MouseEventHandler<HTMLSpanElement>;
  beginHandleTouchMovement: React.TouchEventHandler<HTMLSpanElement>;
  handleKeyDown: React.KeyboardEventHandler<HTMLSpanElement>;
  handleKeyUp: React.KeyboardEventHandler<HTMLSpanElement>;
  tooltipValue: string;
}>;

export const useSliderHandleStateManager = ({
  trackElementRef,
  disabled,
  stepSize,
  min,
  max,
  value,
  labelFractionDigits,
  onChange,
  onRelease,
}: Props): SliderHandleElementAdaptor => {
  // wrap props with ref
  const disabledRef = useValueAsRef(disabled);
  const stepSizeRef = useValueAsRef(stepSize);
  const valueRef = useValueAsRef<number>(value);
  const onChangeRef = useValueAsRef(onChange);
  const onReleaseRef = useValueAsRef(onRelease);

  const clamp = useMemo(() => Num.clamp(min, max), [min, max]);

  const [isMoving, setIsMoving] = useState<boolean>(false);

  // value as ref
  const removeDocumentEventListenersRef = useRef<() => void>(noop);
  const clampRef = useValueAsRef(clamp);
  const isMovingRef = useValueAsRef(isMoving);
  const setIsMovingRef = useValueAsRef(setIsMoving);

  const handleElementRef = useRef<HTMLSpanElement>(null);

  const trackSize = trackElementRef.current?.clientWidth ?? 0;

  const tickSizeRatio = useMemo(
    () =>
      pipe(max - min).chain((l) => (Num.isPositive(l) ? Num.div(1, l) : 0))
        .value,
    [min, max],
  );

  const tickSize = useMemo(
    () => trackSize * tickSizeRatio,
    [trackSize, tickSizeRatio],
  );

  const tickSizeRef = useValueAsRef(tickSize);

  /** Clamp value and invoke callback if it differs from current value */
  const changeValue = useCallback(
    (newValue: number, callback: (v: number) => void = onChangeRef.current) => {
      const newValue_ = clampRef.current(newValue);
      if (!Number.isNaN(newValue_) && valueRef.current !== newValue_) {
        callback(newValue_);
      }
      return newValue_;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /** Convert client pixel to value between min and max. */
  const clientToValue = useCallback((clientPixel: number): number => {
    if (handleElementRef.current === null) {
      return valueRef.current;
    }

    // #1769: this logic doesn't work perfectly when the tick size is
    // smaller than the handle size; it may be off by a tick or two.
    const handleCenterPixel = getHandleElementCenterPixel(
      handleElementRef.current,
    );
    const pixelDelta = clientPixel - handleCenterPixel;

    if (Number.isNaN(pixelDelta)) {
      return valueRef.current;
    }
    // convert pixels to range value in increments of `stepSize`
    return (
      valueRef.current +
      Math.round(
        Num.div(
          pixelDelta,
          toNonZeroFiniteNumber(tickSizeRef.current * stepSizeRef.current),
        ),
      ) *
        stepSizeRef.current
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMovedTo = useCallback(
    (clientPixel: number) => {
      if (isMovingRef.current && !disabledRef.current) {
        changeValue(clientToValue(clientPixel));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleHandleMovement = useCallback(
    (ev: MouseEvent) => {
      handleMovedTo(mouseEventClientOffset(ev));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleHandleTouchMovement = useCallback(
    (ev: TouchEvent) => {
      handleMovedTo(touchEventClientOffset(ev));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleMoveEndedAt = useCallback(
    (clientPixel: number) => {
      removeDocumentEventListenersRef.current();
      setIsMovingRef.current(false);
      // always invoke onRelease; changeValue may call onChange if value is different
      const finalValue = changeValue(clientToValue(clientPixel));
      onReleaseRef.current(finalValue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const endHandleMovement = useCallback(
    (ev: MouseEvent) => {
      handleMoveEndedAt(mouseEventClientOffset(ev));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const endHandleTouchMovement = useCallback(
    (ev: TouchEvent) => {
      handleMoveEndedAt(touchEventClientOffset(ev));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const removeDocumentEventListeners = useCallback(() => {
    document.removeEventListener('mousemove', handleHandleMovement);
    document.removeEventListener('mouseup', endHandleMovement);
    document.removeEventListener('touchmove', handleHandleTouchMovement);
    document.removeEventListener('touchend', endHandleTouchMovement);
    document.removeEventListener('touchcancel', endHandleTouchMovement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beginHandleMovement: React.MouseEventHandler<HTMLSpanElement> =
    useCallback(
      (ev) => {
        document.addEventListener('mousemove', handleHandleMovement);
        document.addEventListener('mouseup', endHandleMovement);
        setIsMovingRef.current(true);
        changeValue(clientToValue(mouseEventClientOffset(ev)));
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

  const beginHandleTouchMovement: React.TouchEventHandler<HTMLSpanElement> =
    useCallback(
      (ev) => {
        document.addEventListener('touchmove', handleHandleTouchMovement);
        document.addEventListener('touchend', endHandleTouchMovement);
        document.addEventListener('touchcancel', endHandleTouchMovement);
        setIsMovingRef.current(true);
        changeValue(clientToValue(touchEventClientOffset(ev)));
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

  const handleKeyDown: React.KeyboardEventHandler<HTMLSpanElement> =
    useCallback(
      (ev) => {
        switch (ev.key) {
          case 'ArrowDown':
          case 'ArrowLeft': {
            changeValue(valueRef.current - stepSizeRef.current);
            // this key event has been handled! prevent browser scroll on up/down
            ev.preventDefault();

            break;
          }
          case 'ArrowUp':
          case 'ArrowRight': {
            changeValue(valueRef.current + stepSizeRef.current);
            ev.preventDefault();

            break;
          }

          default:
            break;
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

  const handleKeyUp: React.KeyboardEventHandler<HTMLSpanElement> = useCallback(
    (ev) => {
      if (
        ev.key === 'ArrowUp' ||
        ev.key === 'ArrowLeft' ||
        ev.key === 'ArrowRight' ||
        ev.key === 'ArrowDown'
      ) {
        onReleaseRef.current(valueRef.current);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const tooltipValue = useMemo(
    () => value.toFixed(labelFractionDigits),
    [value, labelFractionDigits],
  );

  useEffect(() => {
    removeDocumentEventListenersRef.current = removeDocumentEventListeners;
    return removeDocumentEventListeners;
  }, [removeDocumentEventListeners]);

  return {
    handleElementRef,
    beginHandleMovement,
    beginHandleTouchMovement,
    handleKeyDown,
    handleKeyUp,
    tooltipValue,
  };
};

const mouseEventClientOffset = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  ev: MouseEvent | React.MouseEvent<HTMLElement>,
): number => ev.clientX;

const touchEventClientOffset = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  ev: React.TouchEvent<HTMLElement> | TouchEvent,
): number => ev.changedTouches[0]?.clientX ?? 0;

const getHandleMidpointAndOffset = (
  handleElement: HTMLElement,
  useOppositeDimension: boolean = false,
): Readonly<{
  handleMidpoint: number;
  handleOffset: number;
}> => {
  // getBoundingClientRect().height includes border size; clientHeight does not.
  const handleRect = handleElement.getBoundingClientRect();

  const sizeKey = useOppositeDimension ? 'height' : 'width';

  // "bottom" value seems to be consistently incorrect, so explicitly
  // calculate it using the window offset instead.
  const handleOffset = handleRect.left;

  return { handleMidpoint: handleRect[sizeKey] / 2, handleOffset };
};

const getHandleElementCenterPixel = (handleElement: HTMLElement): number => {
  const { handleMidpoint, handleOffset } =
    getHandleMidpointAndOffset(handleElement);
  return handleOffset + handleMidpoint;
};
