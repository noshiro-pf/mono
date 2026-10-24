import * as t from 'ts-fortress';

/** The longest `error` a report may carry, which bounds the mail it becomes. */
export const sendReportErrorMaxLength = 20_000;

const sendReportPayloadTypeDef = t.record({
  error: t.string('', { maxLength: sendReportErrorMaxLength }),
});

export type SendReportPayload = t.TypeOf<typeof sendReportPayloadTypeDef>;

export const isSendReportPayload = sendReportPayloadTypeDef.is;
