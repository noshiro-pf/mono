import * as React from 'react';
import { SvgSlideshow } from '../svg-slideshow.js';

export const RxjsGlitchSlides = React.memo(() => (
  <SvgSlideshow
    alt={`RxJS glitch animation`}
    numSlides={13}
    slidesPath={'/mono/synstate/rxjs-glitch-slides'}
  />
));

RxjsGlitchSlides.displayName = 'RxjsGlitchSlides';
