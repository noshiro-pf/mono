import { memoNamed } from '@noshiro/react-utils';
import type { Hue, RectSize, Rgba } from '@noshiro/ts-utils';
import { hslaToRgba } from '@noshiro/ts-utils';
import { Application, InteractionManager, settings } from 'pixi.js';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  addGlobalPointerEventListener,
  createGlobalPixiObjects,
} from './functions';
import type { CanvasAppState } from './state';
import { canvasAppStateHandlerGenerator, defaultCanvasAppState } from './state';
import type { AnnotationCanvasStyle, IdType, PixiGlobalObjects } from './types';
import { zIndex } from './z-index';

type Props = Readonly<{
  idMaker: () => IdType;
  canvasStyles: AnnotationCanvasStyle;
  canvasSize: RectSize;
  selectedHue: Hue;
}>;

export const CanvasMain = memoNamed<Props>('CanvasMain', (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [
    //
    pixiGlobalObjects,
    setPixiGlobalObjects,
  ] = useState<PixiGlobalObjects>();

  const [pixiApp, setPixiApp] = useState<Application>();

  useEffect(() => {
    // Pixi.js global settings
    settings.SORTABLE_CHILDREN = true;
    settings.ROUND_PIXELS = true;

    // should initialize in useEffect to wait for canvasRef.current initialization
    const _app = new Application({
      width: 100,
      height: 100,
      transparent: true,
      view: canvasRef.current ?? undefined,
      antialias: false,
    });

    const interactionManager = new InteractionManager(_app.renderer);
    interactionManager.cursorStyles.default = 'crosshair';

    setPixiApp(_app);

    return () => {
      _app.destroy();
    };
  }, []);

  useEffect(() => {
    if (pixiApp === undefined) return;
    const globalPixiObjects = createGlobalPixiObjects({
      app: pixiApp,
      canvasSize: props.canvasSize,
      canvasStyles: props.canvasStyles,
    });

    setPixiGlobalObjects(globalPixiObjects);
  }, [pixiApp, props.canvasSize, props.canvasStyles]);

  useEffect(() => {
    pixiApp?.renderer.resize(props.canvasSize.width, props.canvasSize.height);
  }, [pixiApp, props.canvasSize]);

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
      pixiApp === undefined || pixiGlobalObjects === undefined
        ? undefined
        : canvasAppStateHandlerGenerator(
            pixiApp,
            pixiGlobalObjects,
            props.idMaker,
            props.canvasStyles,
            newBboxColor
          ),
    [
      pixiApp,
      pixiGlobalObjects,
      props.idMaker,
      props.canvasStyles,
      newBboxColor,
    ]
  );

  useEffect(() => {
    if (
      pixiApp === undefined ||
      pixiGlobalObjects === undefined ||
      canvasAppStateHandler === undefined
    )
      return;

    const removeEventListner = addGlobalPointerEventListener(
      pixiApp,
      pixiGlobalObjects.background,
      stateRef.current,
      canvasAppStateHandler
    );

    return () => {
      removeEventListner();
    };
  }, [
    pixiApp,
    pixiGlobalObjects,
    canvasAppStateHandler,
    newBboxColor,
    props.canvasSize,
    props.canvasStyles,
  ]);

  return (
    <canvas
      style={canvasStyle}
      ref={canvasRef}
      width={props.canvasSize.width}
      height={props.canvasSize.height}
    />
  );
});

const canvasStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  zIndex: zIndex.canvasRoot,
};
