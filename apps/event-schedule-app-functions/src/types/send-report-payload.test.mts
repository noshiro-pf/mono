import {
  isSendReportPayload,
  sendReportErrorMaxLength,
} from './send-report-payload.mjs';

describe(isSendReportPayload, () => {
  test('accepts a report up to the maximum length', () => {
    assert.isTrue(
      isSendReportPayload({ error: 'a'.repeat(sendReportErrorMaxLength) }),
    );
  });

  test('rejects a report longer than the maximum length', () => {
    assert.isFalse(
      isSendReportPayload({ error: 'a'.repeat(sendReportErrorMaxLength + 1) }),
    );
  });

  test('rejects a payload without a string `error`', () => {
    assert.isFalse(isSendReportPayload({ error: 0 }));

    assert.isFalse(isSendReportPayload({}));
  });
});
