import * as React from 'react';
import { SvgSlideshow } from '../svg-slideshow.js';

export const SynStateUpdateTokenSlides = React.memo(() => (
  <SvgSlideshow
    alt={`SynState Update Token animation`}
    numSlides={14}
    slidesPath={'/synstate/synstate-update-token-slides'}
  />
));

SynStateUpdateTokenSlides.displayName = 'SynStateUpdateTokenSlides';
