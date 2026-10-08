import * as t from 'ts-fortress';

const sendReportPayloadTypeDef = t.record({
  error: t.string(''),
});

export type SendReportPayload = t.TypeOf<typeof sendReportPayloadTypeDef>;

export const isSendReportPayload = sendReportPayloadTypeDef.is;
