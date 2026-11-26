import { hasKey, isRecord } from 'ts-data-forge';

/**
 * Writes one repository variable: an update, and a creation only when the
 * update answers `404`. The method is not chosen from the list of variables:
 * that list is read by offset, page by page, and can miss a variable created
 * or deleted between two requests, which a creation would then meet as `409
 * Already exists`. Kept apart from the API calls, whose client is built at
 * import, so that the choice can be tested.
 */
export const putVariableWith = async (
  api: Readonly<{
    update: (written: Variable) => Promise<void>;
    create: (written: Variable) => Promise<void>;
  }>,
  variable: Variable,
): Promise<void> => {
  try {
    await api.update(variable);
  } catch (error: unknown) {
    if (!isNotFound(error)) {
      throw error;
    }

    await api.create(variable);
  }
};

type Variable = Readonly<{ name: string; value: string }>;

/** Whether `error` is an API answer of `404`, as Octokit throws one. */
const isNotFound = (error: unknown): boolean =>
  isRecord(error) && hasKey(error, 'status') && error.status === 404;
