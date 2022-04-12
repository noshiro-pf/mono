/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/// <reference no-default-lib="true"/>

declare namespace Intl {
  interface DateTimeFormatOptions {
    readonly formatMatcher?: 'basic' | 'best fit' | 'best fit' | undefined;
    readonly dateStyle?: 'full' | 'long' | 'medium' | 'short' | undefined;
    readonly timeStyle?: 'full' | 'long' | 'medium' | 'short' | undefined;
    readonly dayPeriod?: 'narrow' | 'short' | 'long' | undefined;
    readonly fractionalSecondDigits?: 0 | 1 | 2 | 3 | undefined;
  }

  interface ResolvedDateTimeFormatOptions {
    readonly formatMatcher?: 'basic' | 'best fit' | 'best fit';
    readonly dateStyle?: 'full' | 'long' | 'medium' | 'short';
    readonly timeStyle?: 'full' | 'long' | 'medium' | 'short';
    readonly hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
    readonly dayPeriod?: 'narrow' | 'short' | 'long';
    readonly fractionalSecondDigits?: 0 | 1 | 2 | 3;
  }

  interface NumberFormat {
    formatRange(startDate: number | bigint, endDate: number | bigint): string;
    formatRangeToParts(
      startDate: number | bigint,
      endDate: number | bigint
    ): readonly NumberFormatPart[];
  }
}
