import { memoNamed, useState } from '@noshiro/react-utils';
import type { Hue, RectSize, Rgba } from '@noshiro/ts-utils-additional';
import { hslaToRgba } from '@noshiro/ts-utils-additional';
import {
  Application,
  InteractionManager,
  settings as mut_settings,
} from 'pixi.js';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import {
  addGlobalPointerEventListener,
  createGlobalPixiObjects,
} from './functions';
import type { CanvasAppState } from './state';
import { canvasAppStateHandlerGenerator, defaultCanvasAppState } from './state';
import type { AnnotationCanvasStyle, IdType, PixiApp } from './types';
import { zIndex } from './z-index';

// Pixi.js global settings
mut_settings.SORTABLE_CHILDREN = true;
mut_settings.ROUND_PIXELS = true;

type Props = Readonly<{
  idMaker: () => IdType;
  canvasStyles: AnnotationCanvasStyle;
  canvasSize: RectSize;
  selectedHue: Hue;
}>;

export const CanvasMain = memoNamed<Props>('CanvasMain', (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { state: pixiApp, setState: setPixiApp } = useState<
    PixiApp | undefined
  >(undefined);

  useEffect(() => {
    // should initialize in useEffect to wait for canvasRef.current initialization
    const app = new Application({
      width: props.canvasSize.width,
      height: props.canvasSize.height,
      transparent: true,
      view: canvasRef.current ?? undefined,
      antialias: false,
    });

    const mut_interactionManager = new InteractionManager(app.renderer);
    mut_interactionManager.cursorStyles['default'] = 'crosshair';

    const globalPixiObjects = createGlobalPixiObjects({
      app,
      canvasSize: props.canvasSize,
      canvasStyles: props.canvasStyles,
    });

    setPixiApp({ app, ...globalPixiObjects });

    return () => {
      app.destroy();
    };
  }, [props.canvasSize, props.canvasStyles, setPixiApp]);

  const newBboxColor = useMemo<{ border: Rgba; face: Rgba }>(
    () => ({
      border: hslaToRgba([
        props.selectedHue,
        ...props.canvasStyles.bbox.borderColorSLA.notSelected,
      ]),
      face: hslaToRgba([
        props.selectedHue,
        ...props.canvasStyles.bbox.highlightedFaceColorSLA,
      ]),
    }),
    [props.selectedHue, props.canvasStyles.bbox]
  );

  const stateRef = useRef<CanvasAppState>(defaultCanvasAppState);

  const canvasAppStateHandler = useMemo(
    () =>
      pixiApp === undefined
        ? undefined
        : canvasAppStateHandlerGenerator(
            pixiApp,
            props.idMaker,
            props.canvasStyles,
            newBboxColor
          ),
    [pixiApp, props.idMaker, props.canvasStyles, newBboxColor]
  );

  useEffect(() => {
    if (pixiApp === undefined || canvasAppStateHandler === undefined) return;

    const removePointerEventListener = addGlobalPointerEventListener(
      pixiApp.app,
      pixiApp.background,
      stateRef.current,
      canvasAppStateHandler
    );

    return () => {
      removePointerEventListener();
    };
  }, [
    pixiApp,
    canvasAppStateHandler,
    newBboxColor,
    props.canvasSize,
    props.canvasStyles,
  ]);

  return (
    <canvas
      ref={canvasRef}
      height={props.canvasSize.height}
      style={canvasStyle}
      width={props.canvasSize.width}
    />
  );
});

const canvasStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  zIndex: zIndex.canvasRoot,
};
