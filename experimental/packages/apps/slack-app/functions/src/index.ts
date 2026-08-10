import { Json } from '@noshiro/ts-utils';
import { firestore as admin_firestore, initializeApp } from 'firebase-admin';
import {
  config,
  firestore,
  https as functions_https,
  logger,
} from 'firebase-functions';
import { get } from 'https';

/// <reference path="./globals.d.ts" />

// The Firebase Admin SDK to access Cloud Firestore.
initializeApp();

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
const SLACK_API_KEY: string = config()['slack']?.apikey ?? '';

// Take the text parameter passed to this HTTP endpoint and insert it into
// Cloud Firestore under the path /messages/:documentId/original
export const addMessage = functions_https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query['text'];
  // Push the new message into Cloud Firestore using the Firebase Admin SDK.
  const writeResult = await admin_firestore()
    .collection('messages')
    .add({ original });
  // Send back a message that we've successfully written the message

  res.json({
    result: `Message with ID: ${writeResult.id} added. (${SLACK_API_KEY.length})`,
  });
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
export const makeUppercase = firestore
  .document('/messages/{documentId}')
  .onCreate(async (snap, context) => {
    // Grab the current value of what was written to Cloud Firestore.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const original: string = snap.data()['original'];

    // Access the parameter `{documentId}` with `context.params`
    logger.log('Uppercasing', context.params['documentId'], original);

    const uppercase = original.toUpperCase();

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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
            const r = Json.parse(events.toString()) as any;

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            console.log(r?.messages?.matches[0].ts);
            resolve(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
              r?.members?.find(
                (a: Readonly<{ name: string }>) => a.name === 'noshiro.pf',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              )?.profile?.display_name_normalized,
            );
          });
      });
    });

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to Cloud Firestore.
    // Setting an 'uppercase' field in Cloud Firestore document returns a Promise.
    return snap.ref.set(
      { uppercase, display_name_normalized: result },
      { merge: true },
    );
  });
