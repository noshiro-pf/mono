/// <reference lib="es2018.intl" />

declare namespace Intl {
  /**
   * The locale matching algorithm to use.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_negotiation).
   */
  type DurationFormatLocaleMatcher = 'lookup' | 'best fit';

  /**
   * The style of the formatted duration.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/DurationFormat#style).
   */
  type DurationFormatStyle = 'long' | 'short' | 'narrow' | 'digital';

  /**
   * Whether to always display a unit, or only if it is non-zero.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/DurationFormat#display).
   */
  type DurationFormatDisplayOption = 'always' | 'auto';

  /**
   * Value of the `unit` property in duration objects
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/format#duration).
   */
  type DurationFormatUnit =
    | 'years'
    | 'months'
    | 'weeks'
    | 'days'
    | 'hours'
    | 'minutes'
    | 'seconds'
    | 'milliseconds'
    | 'microseconds'
    | 'nanoseconds';

  type DurationFormatUnitSingular =
    | 'year'
    | 'month'
    | 'week'
    | 'day'
    | 'hour'
    | 'minute'
    | 'second'
    | 'millisecond'
    | 'microsecond'
    | 'nanosecond';

  /**
   * An object representing the relative time format in parts
   * that can be used for custom locale-aware formatting.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/formatToParts).
   */
  type DurationFormatPart =
    | {
        readonly type: 'literal';
        readonly value: string;
        readonly unit?: DurationFormatUnitSingular;
      }
    | {
        readonly type: Exclude<NumberFormatPartTypes, 'literal'>;
        readonly value: string;
        readonly unit: DurationFormatUnitSingular;
      };

  /**
   * An object with some or all properties of the `Intl.DurationFormat` constructor `options` parameter.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/DurationFormat#parameters)
   */
  interface DurationFormatOptions {
    readonly localeMatcher?: DurationFormatLocaleMatcher | undefined;
    readonly numberingSystem?: string | undefined;
    readonly style?: DurationFormatStyle | undefined;
    readonly years?: 'long' | 'short' | 'narrow' | undefined;
    readonly yearsDisplay?: DurationFormatDisplayOption | undefined;
    readonly months?: 'long' | 'short' | 'narrow' | undefined;
    readonly monthsDisplay?: DurationFormatDisplayOption | undefined;
    readonly weeks?: 'long' | 'short' | 'narrow' | undefined;
    readonly weeksDisplay?: DurationFormatDisplayOption | undefined;
    readonly days?: 'long' | 'short' | 'narrow' | undefined;
    readonly daysDisplay?: DurationFormatDisplayOption | undefined;
    readonly hours?:
      | 'long'
      | 'short'
      | 'narrow'
      | 'numeric'
      | '2-digit'
      | undefined;
    readonly hoursDisplay?: DurationFormatDisplayOption | undefined;
    readonly minutes?:
      | 'long'
      | 'short'
      | 'narrow'
      | 'numeric'
      | '2-digit'
      | undefined;
    readonly minutesDisplay?: DurationFormatDisplayOption | undefined;
    readonly seconds?:
      | 'long'
      | 'short'
      | 'narrow'
      | 'numeric'
      | '2-digit'
      | undefined;
    readonly secondsDisplay?: DurationFormatDisplayOption | undefined;
    readonly milliseconds?: 'long' | 'short' | 'narrow' | 'numeric' | undefined;
    readonly millisecondsDisplay?: DurationFormatDisplayOption | undefined;
    readonly microseconds?: 'long' | 'short' | 'narrow' | 'numeric' | undefined;
    readonly microsecondsDisplay?: DurationFormatDisplayOption | undefined;
    readonly nanoseconds?: 'long' | 'short' | 'narrow' | 'numeric' | undefined;
    readonly nanosecondsDisplay?: DurationFormatDisplayOption | undefined;
    readonly fractionalDigits?:
      | 0
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6
      | 7
      | 8
      | 9
      | undefined;
  }

  /**
   * The Intl.DurationFormat object enables language-sensitive duration formatting.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat)
   */
  interface DurationFormat {
    /**
     * @param duration The duration object to be formatted. It should include some or all of the following properties: months, weeks, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds.
     *
     * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/format).
     */
    format(duration: Partial<Record<DurationFormatUnit, number>>): string;
    /**
     * @param duration The duration object to be formatted. It should include some or all of the following properties: months, weeks, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds.
     *
     * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/formatToParts).
     */
    formatToParts(
      duration: Partial<Record<DurationFormatUnit, number>>,
    ): readonly DurationFormatPart[];
    /**
     * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/resolvedOptions).
     */
    resolvedOptions(): ResolvedDurationFormatOptions;
  }

  interface ResolvedDurationFormatOptions {
    readonly locale: UnicodeBCP47LocaleIdentifier;
    readonly numberingSystem: string;
    readonly style: DurationFormatStyle;
    readonly years: 'long' | 'short' | 'narrow';
    readonly yearsDisplay: DurationFormatDisplayOption;
    readonly months: 'long' | 'short' | 'narrow';
    readonly monthsDisplay: DurationFormatDisplayOption;
    readonly weeks: 'long' | 'short' | 'narrow';
    readonly weeksDisplay: DurationFormatDisplayOption;
    readonly days: 'long' | 'short' | 'narrow';
    readonly daysDisplay: DurationFormatDisplayOption;
    readonly hours: 'long' | 'short' | 'narrow' | 'numeric' | '2-digit';
    readonly hoursDisplay: DurationFormatDisplayOption;
    readonly minutes: 'long' | 'short' | 'narrow' | 'numeric' | '2-digit';
    readonly minutesDisplay: DurationFormatDisplayOption;
    readonly seconds: 'long' | 'short' | 'narrow' | 'numeric' | '2-digit';
    readonly secondsDisplay: DurationFormatDisplayOption;
    readonly milliseconds: 'long' | 'short' | 'narrow' | 'numeric';
    readonly millisecondsDisplay: DurationFormatDisplayOption;
    readonly microseconds: 'long' | 'short' | 'narrow' | 'numeric';
    readonly microsecondsDisplay: DurationFormatDisplayOption;
    readonly nanoseconds: 'long' | 'short' | 'narrow' | 'numeric';
    readonly nanosecondsDisplay: DurationFormatDisplayOption;
    readonly fractionalDigits?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  }

  const DurationFormat: {
    readonly prototype: DurationFormat;

    /**
     * @param locales A string with a BCP 47 language tag, or an array of such strings.
     *   For the general form and interpretation of the `locales` argument, see the [Intl](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#locale_identification_and_negotiation)
     *   page.
     *
     * @param options An object for setting up a duration format.
     *
     * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/DurationFormat).
     */
    new (
      locales?: LocalesArgument,
      options?: DurationFormatOptions,
    ): DurationFormat;

    /**
     * Returns an array containing those of the provided locales that are supported in display names without having to fall back to the runtime's default locale.
     *
     * @param locales A string with a BCP 47 language tag, or an array of such strings.
     *   For the general form and interpretation of the `locales` argument, see the [Intl](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#locale_identification_and_negotiation)
     *   page.
     *
     * @param options An object with a locale matcher.
     *
     * @returns An array of strings representing a subset of the given locale tags that are supported in display names without having to fall back to the runtime's default locale.
     *
     * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/supportedLocalesOf).
     */
    supportedLocalesOf(
      locales?: LocalesArgument,
      options?: { readonly localeMatcher?: DurationFormatLocaleMatcher },
    ): readonly UnicodeBCP47LocaleIdentifier[];
  };
}
