import * as t from 'ts-fortress';

const verifyEmailPayloadTypeDef = t.record({
  eventId: t.string(''),
  email: t.string(''),
});

export type VerifyEmailPayload = t.TypeOf<typeof verifyEmailPayloadTypeDef>;

export const isVerifyEmailPayload = verifyEmailPayloadTypeDef.is;
