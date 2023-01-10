import * as t from '@noshiro/io-ts';

const sendReportPayloadTypeDef = t.record({
  error: t.string(''),
});

export type SendReportPayload = t.TypeOf<typeof sendReportPayloadTypeDef>;

export const isSendReportPayload = sendReportPayloadTypeDef.is;
