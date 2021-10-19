// Copyright 2015 Palantir Technologies, Inc. All rights reserved.
// Licensed under the Apache License, Version 2.0.

import { hexToRgba } from '../utils';
import {
  black,
  blue2,
  blue3,
  blue5,
  cobalt1,
  cobalt2,
  cobalt3,
  cobalt4,
  cobalt5,
  darkGray1,
  darkGray3,
  gray1,
  gray4,
  green3,
  lightGray5,
  orange3,
  red3,
  white,
} from './colors';

export const ptIntentPrimary = blue3;
export const ptIntentSuccess = green3;
export const ptIntentWarning = orange3;
export const ptIntentDanger = red3;

export const ptAppBackgroundColor = lightGray5;
export const ptDarkAppBackgroundColor = darkGray3;

export const ptOutlineColor = hexToRgba(blue3, 0.6);

export const ptTextColor = darkGray1;
export const ptTextColorMuted = gray1;
export const ptTextColorDisabled = hexToRgba(ptTextColorMuted, 0.6);
export const ptHeadingColor = ptTextColor;
export const ptLinkColor = blue2;
export const ptDarkTextColor = lightGray5;
export const ptDarkTextColorMuted = gray4;
export const ptDarkTextColorDisabled = hexToRgba(ptDarkTextColorMuted, 0.6);
export const ptDarkHeadingColor = ptDarkTextColor;
export const ptDarkLinkColor = blue5;
// Default text selection color using #7dbcff
export const ptTextSelectionColor = `rgba(125, 188, 255, 0.6)`;

export const ptIconColor = ptTextColorMuted;
export const ptIconColorHover = ptTextColor;
export const ptIconColorDisabled = ptTextColorDisabled;
export const ptIconColorSelected = ptIntentPrimary;
export const ptDarkIconColor = ptDarkTextColorMuted;
export const ptDarkIconColorHover = ptDarkTextColor;
export const ptDarkIconColorDisabled = ptDarkTextColorDisabled;
export const ptDarkIconColorSelected = ptIntentPrimary;

export const ptDividerBlack = hexToRgba(black, 0.15);
export const ptDarkDividerBlack = hexToRgba(black, 0.4);
export const ptDarkDividerWhite = hexToRgba(white, 0.15);

export const ptCodeTextColor = ptTextColorMuted;
export const ptDarkCodeTextColor = ptDarkTextColorMuted;
export const ptCodeBackgroundColor = hexToRgba(white, 0.7);
export const ptDarkCodeBackgroundColor = hexToRgba(black, 0.3);

// "cobalt" is becoming "cerulean" in Blueprint 4.0
// for a smoother migration, we provide these aliases so that consumers
// can reference the new names in 3.x
export const cerulean1 = cobalt1;
export const cerulean2 = cobalt2;
export const cerulean3 = cobalt3;
export const cerulean4 = cobalt4;
export const cerulean5 = cobalt5;
