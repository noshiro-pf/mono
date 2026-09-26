import {
  idleWaitSec,
  initialQuiet,
  observeSurvey,
  surveyFingerprint,
} from './quiet.mjs';
import { type PullRequest, type Quiet } from './types.mjs';

const pullRequest = (
  fields: Partial<PullRequest> & Readonly<{ number: number }>,
): PullRequest =>
  ({
    title: `pull request #${fields.number}`,
    body: '',
    state: 'OPEN',
    headRefName: `feature/${fields.number}`,
    headRefOid: 'a'.repeat(40),
    baseRefName: 'main',
    isDraft: false,
    mergeStateStatus: 'BLOCKED',
    autoMergeRequest: {},
    labels: [],
    ...fields,
  }) as const;

const baseSha = 'b'.repeat(40);

const intervals = {
  activeIntervalSec: 30,
  idleIntervalSec: 300,
  idleAfter: 3,
} as const;

const observeTimes = (fingerprint: string, times: number): Quiet =>
  Array.from({ length: times }).reduce<Quiet>(
    (quiet) => observeSurvey(quiet, fingerprint),
    initialQuiet,
  );

describe('surveyFingerprint', () => {
  const one = pullRequest({ number: 1 });

  test('is the same for the same list in another order', () => {
    const two = pullRequest({ number: 2 });

    assert.strictEqual(
      surveyFingerprint({ pullRequests: [one, two], baseSha }),
      surveyFingerprint({ pullRequests: [two, one], baseSha }),
    );
  });

  test('changes when a pull request is opened', () => {
    assert.notStrictEqual(
      surveyFingerprint({ pullRequests: [one], baseSha }),
      surveyFingerprint({
        pullRequests: [one, pullRequest({ number: 2 })],
        baseSha,
      }),
    );
  });

  test('changes when the base moves', () => {
    assert.notStrictEqual(
      surveyFingerprint({ pullRequests: [one], baseSha }),
      surveyFingerprint({ pullRequests: [one], baseSha: 'c'.repeat(40) }),
    );
  });

  test.each([
    ['a push', { headRefOid: 'd'.repeat(40) }],
    ['a merge state', { mergeStateStatus: 'BEHIND' }],
    ['a label', { labels: [{ name: 'merge-queued' }] }],
    ['auto-merge', { autoMergeRequest: null }],
    ['the draft flag', { isDraft: true }],
    ['a Merge-After in the body', { body: 'Merge-After: #3' }],
  ] as const)('changes with %s', (_, fields) => {
    assert.notStrictEqual(
      surveyFingerprint({ pullRequests: [one], baseSha }),
      surveyFingerprint({
        pullRequests: [pullRequest({ number: 1, ...fields })],
        baseSha,
      }),
    );
  });

  // What a pull request's review holds is read by triage, not listed by
  // `gh`, so it is passed in: an approval or a resolved conversation is what
  // the held pull request was waiting for.
  test('changes when what a review holds changes', () => {
    const held = ['#1: waiting for @owner to approve a.yml'] as const;

    assert.notStrictEqual(
      surveyFingerprint({ pullRequests: [one], baseSha }, held),
      surveyFingerprint({ pullRequests: [one], baseSha }, []),
    );

    assert.strictEqual(
      surveyFingerprint({ pullRequests: [one], baseSha }, held),
      surveyFingerprint({ pullRequests: [one], baseSha }, Array.from(held)),
    );
  });

  // Nothing triage reads depends on the title, so an edit to it is not
  // something to hurry back for.
  test('ignores a retitle', () => {
    assert.strictEqual(
      surveyFingerprint({ pullRequests: [one], baseSha }),
      surveyFingerprint({
        pullRequests: [pullRequest({ number: 1, title: 'renamed' })],
        baseSha,
      }),
    );
  });

  test('ignores the order the labels are listed in', () => {
    const a = { name: 'merge-queued' } as const;

    const b = { name: 'skip-ci' } as const;

    assert.strictEqual(
      surveyFingerprint({
        pullRequests: [pullRequest({ number: 1, labels: [a, b] })],
        baseSha,
      }),
      surveyFingerprint({
        pullRequests: [pullRequest({ number: 1, labels: [b, a] })],
        baseSha,
      }),
    );
  });
});

describe('observeSurvey', () => {
  test('counts nothing on the first survey', () => {
    assert.strictEqual(observeTimes('x', 1).unchanged, 0);
  });

  test('counts each survey that saw what the one before it saw', () => {
    assert.strictEqual(observeTimes('x', 4).unchanged, 3);
  });

  test('starts over when the list changes', () => {
    const quiet = observeSurvey(observeTimes('x', 4), 'y');

    assert.strictEqual(quiet.unchanged, 0);

    assert.strictEqual(quiet.fingerprint, 'y');
  });
});

describe('idleWaitSec', () => {
  test('waits the short interval right after a change', () => {
    assert.strictEqual(idleWaitSec(observeTimes('x', 1), intervals), 30);
  });

  test('keeps the short interval until the list has sat still long enough', () => {
    assert.strictEqual(idleWaitSec(observeTimes('x', 3), intervals), 30);
  });

  test('slows to the idle interval once it has', () => {
    assert.strictEqual(idleWaitSec(observeTimes('x', 4), intervals), 300);
  });

  test('speeds up again as soon as something changes', () => {
    const quiet = observeSurvey(observeTimes('x', 10), 'y');

    assert.strictEqual(idleWaitSec(quiet, intervals), 30);
  });

  test('waits the short interval before any survey has succeeded', () => {
    assert.strictEqual(idleWaitSec(initialQuiet, intervals), 30);
  });
});
