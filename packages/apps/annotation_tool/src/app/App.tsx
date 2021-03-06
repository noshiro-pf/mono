import {
  memoNamed,
  useBooleanState,
  useStateWithMapFn,
} from '@noshiro/react-utils';
import type {
  Hue,
  Percent,
  ReadonlyNonEmptyArray,
  RectSize,
} from '@noshiro/ts-utils';
import { map, pickupHighContrastHues, pipe, zip } from '@noshiro/ts-utils';
import { useMemo, useReducer } from 'react';
import styled from 'styled-components';
import type { AnnotationCanvasStyle, IdType, Label } from '../canvas';
import { AnnotataionCanvas, defaultAnnotationCanvasStyle } from '../canvas';
import type { AppEventHandler } from './event-handlers';
import { Sidebar, visibleLabelsReducer } from './sidebar';

const canvasSize: RectSize = {
  width: 600,
  height: 600,
};

const canvasStyles: AnnotationCanvasStyle = defaultAnnotationCanvasStyle;

export const [
  //
  saturationDarker,
  saturationLighter,
]: [Percent, Percent] = [80, 100];

export const [
  //
  lightnessDarker,
  lightnessLighter,
]: [Percent, Percent] = [50, 90];

// const highlightAlpha: Alpha = 0.4;

const labelNames = [
  'Ant',
  'Bat',
  'Cat',
  'Dog',
  'Eagle',
  'Falcon',
  'Giraffe',
  'Horse',
] as const;

const hues = pickupHighContrastHues(
  labelNames.length,
  saturationDarker,
  lightnessDarker
) as ReadonlyNonEmptyArray<Hue>;

const labels: ReadonlyNonEmptyArray<Label> = pipe(zip(hues, labelNames)).chain(
  map(
    ([hue, labelName]: readonly [Hue, string], index): Label => ({
      id: index.toString(),
      hue,
      name: labelName,
    })
  )
).value;

const labelInit: Label = labels[0];

export const App = memoNamed('App', () => {
  const [hidden, hide, show] = useBooleanState(false);

  const [visibleLabelIndice, visibleLabelIndiceDispatcher] = useReducer(
    visibleLabelsReducer,
    labels.map(() => true)
  );

  const [selectedLabel, selectLabel] = useStateWithMapFn<Label, IdType>(
    labelInit,
    (labelId) => labels.find((l) => l.id === labelId) ?? labelInit
  );

  const handlers = useMemo<AppEventHandler>(
    () => ({
      collapseLabelList: hide,
      expandLabelList: show,
      showAllLabels: () => {
        visibleLabelIndiceDispatcher({ type: 'show-all' });
      },
      hideAllLabels: () => {
        visibleLabelIndiceDispatcher({ type: 'hide-all' });
      },
      flipLabelVisibility: (labelId) => {
        const index = labels.findIndex((l) => l.id === labelId);
        visibleLabelIndiceDispatcher({ type: 'flip', index });
      },
      selectLabel: selectLabel,
    }),
    [hide, show, selectLabel]
  );

  const visibleLabels = labels.filter((_, i) => visibleLabelIndice[i]);

  return (
    <Root>
      <CanvasWrapper>
        <AnnotataionCanvas
          canvasSize={canvasSize}
          canvasStyles={canvasStyles}
          selectedHue={selectedLabel.hue}
        />
      </CanvasWrapper>
      <SideBarWrapper>
        <Sidebar
          labels={labels}
          labelsSaturation={saturationDarker}
          labelsLightness={lightnessDarker}
          visibleLabels={visibleLabels}
          selectedLabel={selectedLabel}
          hidden={hidden}
          handlers={handlers}
        />
      </SideBarWrapper>
    </Root>
  );
});

const sidebarWidthPx = 250;

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
`;

const CanvasWrapper = styled.div`
  width: calc(100% - ${sidebarWidthPx}px);
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(121, 121, 121);
`;

const SideBarWrapper = styled.div`
  width: ${sidebarWidthPx}px;
  height: 100%;
  background-color: rgb(245, 245, 245);
`;
