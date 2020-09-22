import * as ls from 'local-storage'
import { RN, manual } from 'rnjs'

const myNameSource$ = manual<string>(ls.get('my-name') || '')

export const setMyName = (name: string = ''): void => {
  ls.set('my-name', name)
  myNameSource$.emit(name)
}

export const myName$: RN<string> = myNameSource$
  .withDefault('')
  .skipUnchanged((a, b) => a === b, 'my-name')
