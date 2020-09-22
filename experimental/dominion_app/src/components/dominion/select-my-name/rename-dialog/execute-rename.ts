import * as fb from '~/firebase/firebase-worker'

export const executeRename = async (
  nameBefore: string,
  nameAfter: string
): Promise<any> =>
  Promise.all([
    fb.renameGameResult(nameBefore, nameAfter),
    fb.rename(nameBefore, nameAfter)
  ])
