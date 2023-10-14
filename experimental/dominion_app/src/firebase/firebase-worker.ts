import { initializeApp } from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'
import * as I from 'immutable'
import { combine, fromObservable, RN } from 'rnjs'
import { list } from 'rxfire/database'
import { map } from 'rxjs/operators'
import { fbAppConfig, fbPaths } from '~/constants/firebase-config'
import { DCardPropertyFromJS, TDCardProperty } from '~/types/dcard-property'
import {
  GameResultFromJS,
  GameResultToJS,
  getScored,
  TGameResult,
} from '~/types/game-result'
import {
  RandomizerGroupFromJS,
  TRandomizerGroup,
} from '~/types/randomizer/randomizer-group'
import { TUser, UserFromJS, UserToJS } from '~/types/user'

export const paths = fbPaths
const firebaseApp = initializeApp(fbAppConfig)

export const storage = firebaseApp.storage()

export const database = firebaseApp.database()

const keyGen = () => Math.random().toString()

/* constant data */

export const scoreTable$: RN<I.List<I.List<number>>> = fromObservable(
  [],
  list(database.ref(paths.database.data.scoreTable)).pipe(
    map((changes) => changes.map((c) => c.snapshot.val())),
  ),
).map((s) => I.List(s.map((e) => I.List(e))))

export const expansions$: RN<I.List<string>> = fromObservable(
  [],
  list(database.ref(paths.database.data.expansions)).pipe(
    map((changes) => changes.map((c) => c.snapshot.val())),
  ),
).map((s) => I.List(s))

// dcardlist

export const dcardlist$: RN<I.List<TDCardProperty>> = fromObservable(
  [],
  list(database.ref(paths.database.data.dcardlist)).pipe(
    map((changes) =>
      changes.map((c) =>
        DCardPropertyFromJS({ key: c.snapshot.key, ...c.snapshot.val() }),
      ),
    ),
  ),
).map((dcardlist) => I.List(dcardlist))

export const setDcardImgUrl = (
  key: string,
  frontOrBack: 'front' | 'back',
  imgUrl: string,
): Promise<any> => {
  if (!key) return Promise.resolve()
  return database
    .ref(`${paths.database.data.dcardlist}/${key}/imgUrl/${frontOrBack}`)
    .set(imgUrl)
}

// users

export const users$: RN<I.List<TUser>> = fromObservable(
  [],
  list(database.ref(paths.database.users)).pipe(
    map((changes) => changes.map((c) => UserFromJS(c.snapshot.val()))),
  ),
).map((users) => I.List(users))

export const setUser = (key: string, user: TUser): Promise<any> => {
  if (!key) return Promise.resolve()
  return database.ref(`${paths.database.users}/${key}`).set(UserToJS(user))
}

export const addUser = (user: TUser): Promise<any> => {
  const key = database.ref(paths.database.users).push().key || keyGen()
  return setUser(key, user.set('key', key))
}

export const deleteUserByKey = (key: string): Promise<any> => {
  if (!key) return Promise.resolve()
  return database.ref(`${paths.database.users}/${key}`).remove()
}

export const deleteUserByName = (name: string): Promise<any> => {
  const user = users$.value.find((v) => v.name === name)
  if (!user) return Promise.reject()
  return deleteUserByKey(user.key)
}

export const rename = (nameBefore: string, nameAfter: string): Promise<any> => {
  const user = users$.value.find((v) => v.name === nameBefore)
  if (!user) return Promise.reject()
  return database.ref(`${paths.database.users}/${user.key}/name`).set(nameAfter)
}

// game results

export const gameResults$: RN<I.List<TGameResult>> = combine(
  fromObservable(
    [],
    list(database.ref(paths.database.gameResults)).pipe(
      map((changes) => changes.map((c) => GameResultFromJS(c.snapshot.val()))),
    ),
  ),
  scoreTable$,
).map(([gameResults, scoreTable]) =>
  I.List(gameResults).map((gr) =>
    gr.set('players', getScored(scoreTable, gr.players, gr.lastTurnPlayer)),
  ),
)

export const setGameResult = (key: string, gr: TGameResult): Promise<any> => {
  console.log(key, gr.toJS())
  if (!key) return Promise.resolve()
  return database
    .ref(`${paths.database.gameResults}/${key}`)
    .set(GameResultToJS(gr))
}

export const addGameResult = (gr: TGameResult): Promise<any> => {
  const key = database.ref(paths.database.gameResults).push().key || keyGen()
  return setGameResult(key, gr.set('key', key))
}

export const renameGameResult = (
  nameBefore: string,
  nameAfter: string,
): Promise<any> => {
  const updates: { [key: string]: any } = {}
  gameResults$.value.forEach((gr) => {
    if (gr.lastTurnPlayer === nameBefore) {
      updates[`/${gr.key}/lastTurnPlayer`] = nameAfter
    }
    gr.players.forEach((p, i) => {
      if (p.name === nameBefore) {
        updates[`/${gr.key}/players/${i}/name`] = nameAfter
      }
    })
  })

  return database.ref(paths.database.gameResults).update(updates)
}

// randomizer-groups

export const randomizerGroups$: RN<I.List<TRandomizerGroup>> = fromObservable(
  [],
  list(database.ref(paths.database.randomizerGroups)).pipe(
    map((changes) =>
      changes.map((c) => RandomizerGroupFromJS(c.snapshot.val())),
    ),
  ),
).map((randomizerGroups) => I.List(randomizerGroups))
