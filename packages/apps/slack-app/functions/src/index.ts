import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { defineString } from 'firebase-functions/params';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { get } from 'https';

/// <reference path="./globals.d.ts" />

// The Firebase Admin SDK to access Cloud Firestore.
initializeApp();

const slackApiKeyDef = defineString('SLACK_APIKEY');

// Take the text parameter passed to this HTTP endpoint and insert it into
// Cloud Firestore under the path /messages/:documentId/original

export const addMessage = onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query['text'];
  // Push the new message into Cloud Firestore using the Firebase Admin SDK.
  const writeResult = await getFirestore()
    .collection('messages')
    .add({ original });
  // Send back a message that we've successfully written the message

  const SLACK_API_KEY: string = slackApiKeyDef.value();

  res.json({
    result: `Message with ID: ${writeResult.id} added. (${SLACK_API_KEY.length})`,
  });
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase

export const makeUppercase = onDocumentCreated(
  '/messages/{documentId}',
  async (event) => {
    const snap = event.data;

    // Grab the current value of what was written to Cloud Firestore.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const original: string = snap?.data()['original'];

    // Access the parameter `{documentId}` with `context.params`
    logger.log('Uppercasing', event.params['documentId'], original);

    const uppercase = original.toUpperCase();

    const SLACK_API_KEY: string = slackApiKeyDef.value();

    const searchUrl = `https://slack.com/api/users.list?token=${SLACK_API_KEY}&pretty=1`;

    const result = await new Promise((resolve) => {
      const mut_data: Buffer[] = [];

      get(searchUrl, (res) => {
        res
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
          .on('data', (chunk: Buffer) => {
            mut_data.push(chunk);
          })
          .on('end', () => {
            const events: Buffer = Buffer.concat(
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              mut_data as unknown as Uint8Array[],
            );
            // eslint-disable-next-line no-restricted-globals, total-functions/no-unsafe-type-assertion
            const r = JSON.parse(events.toString()) as
              | DeepReadonly<{
                  messages?: { matches: NonEmptyArray<{ ts: string }> };
                  members?: {
                    name: string;
                    profile?: { display_name_normalized: string };
                  }[];
                }>
              | undefined;

            console.log(r?.messages?.matches[0].ts);
            resolve(
              r?.members?.find(
                (a: Readonly<{ name: string }>) => a.name === 'noshiro.pf',
              )?.profile?.display_name_normalized,
            );
          });
      });
    });

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to Cloud Firestore.
    // Setting an 'uppercase' field in Cloud Firestore document returns a Promise.
    return snap?.ref.set(
      { uppercase, display_name_normalized: result },
      { merge: true },
    );
  },
);
