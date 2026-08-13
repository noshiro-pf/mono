import * as React from 'react';
import { SvgSlideshow } from '../svg-slideshow.js';

export const PriorityQueueSlides = React.memo(() => (
  <SvgSlideshow
    alt={`Priority Queue animation`}
    numSlides={13}
    slidesPath={'/mono/synstate/priority-queue-slides'}
  />
));

PriorityQueueSlides.displayName = 'PriorityQueueSlides';
