/**
 * The tests under `test/` that need the Firestore emulator: those of the
 * Firestore rules, by name, so that a new one needs no entry here.
 * `vitest.rules.config.mts` runs exactly these and `vitest.config.mts` leaves
 * out exactly these, so that a test is run by one of the two configs.
 */
export const emulatorTests = ['test/firestore-*.test.mts'] as const;
