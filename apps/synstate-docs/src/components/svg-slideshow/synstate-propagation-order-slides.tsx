import * as React from 'react';
import { SvgSlideshow } from '../svg-slideshow.js';

export const SynStatePropagationOrderSlides = React.memo(() => (
  <SvgSlideshow
    alt={`SynState Propagation Order animation`}
    numSlides={5}
    slidesPath={'/synstate/synstate-propagation-order-slides'}
  />
));

SynStatePropagationOrderSlides.displayName = 'SynStatePropagationOrderSlides';
