import * as I from 'immutable'
import { combine, RN } from 'rnjs'
import * as ls from '~/local-storage-api'
import { TDCardProperty } from '~/types/dcard-property'
import { TRandomizerGroup } from '~/types/randomizer/randomizer-group'
import { TUser, User } from '~/types/user'
import {
  dcardlist$,
  gameResults$,
  randomizerGroups$,
  users$,
} from './firebase-worker'

export const cardIdToDCardProperty$: RN<I.Map<string, TDCardProperty>> =
  dcardlist$.map((dcardlist) => {
    const m = new Map<string, TDCardProperty>()
    dcardlist.forEach((d) => m.set(d.cardId, d))
    return I.Map(m)
  })

export const me$: RN<TUser> = combine(users$, ls.myName$).map(
  ([users, myName]) =>
    users.find((u) => u.name === myName) || User({ name: myName }),
  'me'
)

export const currentRandomizerGroup$: RN<TRandomizerGroup | undefined> =
  combine(
    randomizerGroups$,
    me$.pluck('randomizerGroupId').skipUnchanged()
  ).map(([list, id]) => list.find((r) => r.key === id))

export const nameListFromGameResults$: RN<I.List<string>> = gameResults$.map(
  (gameResults) => {
    const names = new Set<string>()
    gameResults.forEach((g) => {
      g.players.forEach((p) => {
        names.add(p.name)
      })
    })
    return I.List(names).sort()
  }
)

export const placeListFromGameResults$: RN<I.List<string>> = gameResults$.map(
  (gameResults) => {
    const places = new Set<string>(gameResults.map((g) => g.place))
    return I.List(places)
      .filter((e) => e !== '')
      .sort()
  }
)
