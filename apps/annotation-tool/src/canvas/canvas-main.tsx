import {
  Application,
  InteractionManager,
  settings as mut_settings,
} from 'pixi.js-legacy';
import { onScopeDispose } from 'synstate';
import {
  constant,
  createAfterUpdate,
  subscribeInScope,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import {
  hslaToRgba,
  type Hue,
  type RectSize,
  type Rgba,
} from 'ts-utils-additional';
import {
  addGlobalPointerEventListener,
  createGlobalPixiObjects,
} from './functions/index.mjs';
import {
  canvasAppStateHandlerGenerator,
  createCanvasAppState,
} from './state/index.mjs';
import type { AnnotationCanvasStyle, IdType, PixiApp } from './types/index.mjs';
import { zIndex } from './z-index.mjs';

// Pixi.js global settings
mut_settings.SORTABLE_CHILDREN = true;

mut_settings.ROUND_PIXELS = true;

type Props = Readonly<{
  idMaker: () => IdType;
  canvasStyles: AnnotationCanvasStyle;
  canvasSize: RectSize;
  selectedHue: Bindable<Hue>;
}>;

/**
 * The PixiJS canvas boxes are drawn on, in the selected label's hue.
 *
 * The application is made once the canvas is in the document, and the pointer
 * listeners are attached again whenever the hue changes, with the drawing state
 * kept across: a box being drawn carries on in the new colour.
 */
export const CanvasMain = ({
  idMaker,
  canvasStyles,
  canvasSize,
  selectedHue,
}: Props): JSX.Element => {
  const afterUpdate = createAfterUpdate();

  const hue$ = toObservable(selectedHue);

  // Mutated by the pointer handlers, and kept across their reattachment.
  const canvasAppState = createCanvasAppState();

  const mut_state: {
    pixiApp: PixiApp | undefined;
    interactionManager: InteractionManager | undefined;
    /** The hue the listeners attached last draw new boxes in. */
    hue: Hue | undefined;
    removePointerEventListener: () => void;
  } = {
    pixiApp: undefined,
    interactionManager: undefined,
    hue: undefined,
    removePointerEventListener: () => {},
  };

  const attachPointerEventListener = (hue: Hue): void => {
    const { pixiApp } = mut_state;

    // Another label of the same hue draws as this one does.
    if (pixiApp === undefined || hue === mut_state.hue) {
      return;
    }

    mut_state.hue = hue;

    mut_state.removePointerEventListener();

    mut_state.removePointerEventListener = addGlobalPointerEventListener(
      pixiApp.app,
      pixiApp.background,
      canvasAppState,
      canvasAppStateHandlerGenerator(
        pixiApp,
        idMaker,
        canvasStyles,
        newBboxColor(canvasStyles, hue),
      ),
    );
  };

  const createPixiApp = (canvas: HTMLCanvasElement): void => {
    const app = new Application({
      width: canvasSize.width,
      height: canvasSize.height,
      transparent: true,
      view: canvas,
      antialias: false,
    });

    const mut_interactionManager = new InteractionManager(app.renderer);

    mut_interactionManager.cursorStyles['default'] = 'crosshair';

    mut_state.interactionManager = mut_interactionManager;

    mut_state.pixiApp = {
      app,
      ...createGlobalPixiObjects({ app, canvasSize, canvasStyles }),
    };

    attachPointerEventListener(hue$.getSnapshot().value);
  };

  subscribeInScope(hue$, attachPointerEventListener);

  onScopeDispose(() => {
    mut_state.removePointerEventListener();

    // Not one of the application's own plugins, which `destroy` takes down.
    mut_state.interactionManager?.destroy();

    mut_state.pixiApp?.app.destroy();
  });

  return (
    <canvas
      ref={(canvas) => {
        afterUpdate(() => {
          createPixiApp(canvas);
        });
      }}
      data-e2e={constant('annotation-canvas')}
      height={constant(canvasSize.height)}
      style={{
        width: constant('100%'),
        height: constant('100%'),
        'z-index': constant(zIndex.canvasRoot.toString()),
      }}
      width={constant(canvasSize.width)}
    />
  );
};

const newBboxColor = (
  canvasStyles: AnnotationCanvasStyle,
  hue: Hue,
): Readonly<{ border: Rgba; face: Rgba }> =>
  ({
    border: hslaToRgba(
      Arr.toUnshifted(hue)(canvasStyles.bbox.borderColorSLA.notSelected),
    ),
    face: hslaToRgba(
      Arr.toUnshifted(hue)(canvasStyles.bbox.highlightedFaceColorSLA),
    ),
  }) as const;
