/// <reference path="./lib.esnext.temporal.d.ts" />

declare namespace Intl {
  type FormattableTemporalObject =
    | Temporal.PlainDate
    | Temporal.PlainYearMonth
    | Temporal.PlainMonthDay
    | Temporal.PlainTime
    | Temporal.PlainDateTime
    | Temporal.Instant;

  interface DateTimeFormat {
    format(date?: FormattableTemporalObject | Date | number): string;
    formatToParts(
      date?: FormattableTemporalObject | Date | number,
    ): readonly DateTimeFormatPart[];
    formatRange(
      startDate: FormattableTemporalObject | Date | number,
      endDate: FormattableTemporalObject | Date | number,
    ): string;
    formatRangeToParts(
      startDate: FormattableTemporalObject | Date | number,
      endDate: FormattableTemporalObject | Date | number,
    ): readonly DateTimeRangeFormatPart[];
  }

  interface Locale {
    /**
     * Returns a list of one or more unique calendar identifiers for this locale.
     *
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getCalendars)
     */
    getCalendars(): readonly string[];
    /**
     * Returns a list of one or more collation types for this locale.
     *
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getCollations)
     */
    getCollations(): readonly string[];
    /**
     * Returns a list of one or more unique hour cycle identifiers for this locale.
     *
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getHourCycles)
     */
    getHourCycles(): readonly string[];
    /**
     * Returns a list of one or more unique numbering system identifiers for this locale.
     *
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getNumberingSystems)
     */
    getNumberingSystems(): readonly string[];
    /**
     * Returns the ordering of characters indicated by either ltr (left-to-right) or by rtl (right-to-left) for this locale.
     *
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo)
     */
    getTextInfo(): TextInfo;
    /**
     * Returns a list of supported time zones for this locale.
     *
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTimeZones)
     */
    getTimeZones(): readonly string[] | undefined;
    /**
     * Returns a `WeekInfo` object with the properties `firstDay`, `weekend` and `minimalDays` for this locale.
     *
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo)
     */
    getWeekInfo(): WeekInfo;
  }

  /**
   * An object representing text typesetting information associated with the Locale data specified in UTS 35's Layouts Elements.
   *
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo#return_value)
   */
  interface TextInfo {
    /**
     * A string indicating the direction of text for the locale. Can be either "ltr" (left-to-right) or "rtl" (right-to-left).
     *
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo#direction)
     */
    readonly direction?: 'ltr' | 'rtl';
  }

  /**
   * An object representing week information associated with the Locale data specified in UTS 35's Week Elements.
   *
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo#return_value)
   */
  interface WeekInfo {
    /**
     * An integer between 1 (Monday) and 7 (Sunday) indicating the first day of the week for the locale. Commonly 1, 5, 6, or 7.
     *
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo#firstday)
     */
    readonly firstDay: number;
    /**
     * An array of integers between 1 and 7 indicating the weekend days for the locale.
     *
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo#weekend)
     */
    readonly weekend: readonly number[];
  }
}
