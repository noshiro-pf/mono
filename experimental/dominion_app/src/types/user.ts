import * as I from 'immutable'
import {
  withDefault,
  withDefaultMix,
} from 'typescript-utils/functions/with-default'

interface IUser {
  key: string
  createdDate: string
  name: string
  randomizerGroupId: string
  onlineGame: {
    selectedExpansions: I.List<string>
    numPlayers: number
    roomId: string
    communicationId: string
    chatOpened: boolean
    cardSizeAutoChange: boolean
    cardSizeRatio: number
    messageSec: number
    autoSort: boolean
  }
}

export interface IUserJS {
  key: string
  createdDate: string
  name: string
  randomizerGroupId: string
  onlineGame: {
    selectedExpansions: string[]
    numPlayers: number
    roomId: string
    communicationId: string
    chatOpened: boolean
    cardSizeAutoChange: boolean
    cardSizeRatio: number
    messageSec: number
    autoSort: boolean
  }
}

export type TUser = I.Record<IUser> & Readonly<IUser>

const UserRecordFactory = I.Record<IUser>({
  key: '',
  createdDate: new Date().toLocaleString(),
  name: '',
  randomizerGroupId: '',
  onlineGame: I.Record({
    selectedExpansions: I.List<string>(),
    numPlayers: 2,
    roomId: '',
    communicationId: '',
    chatOpened: true,
    cardSizeAutoChange: true,
    cardSizeRatio: 1,
    messageSec: 2000,
    autoSort: true,
  })(),
})

export const User = (user?: Partial<TUser>): TUser => {
  const dfl = UserRecordFactory()
  const wd = withDefault(user || dfl, dfl)
  const wdog = withDefault(wd('onlineGame'), dfl.onlineGame)
  return UserRecordFactory({
    key: wd('key'),
    createdDate: wd('createdDate'),
    name: wd('name'),
    randomizerGroupId: wd('randomizerGroupId'),
    onlineGame: {
      selectedExpansions: I.List(wdog('selectedExpansions')),
      numPlayers: wdog('numPlayers'),
      roomId: wdog('roomId'),
      communicationId: wdog('communicationId'),
      chatOpened: wdog('chatOpened'),
      cardSizeAutoChange: wdog('cardSizeAutoChange'),
      cardSizeRatio: wdog('cardSizeRatio'),
      messageSec: wdog('messageSec'),
      autoSort: wdog('autoSort'),
    },
  })
}

export const UserFromJS = (user?: Partial<IUserJS>): TUser => {
  if (user === undefined) return User()
  const wd = withDefaultMix(user, User())
  const wdog = withDefaultMix(wd('onlineGame'), User().onlineGame)
  return UserRecordFactory({
    key: wd('key'),
    createdDate: wd('createdDate'),
    name: wd('name'),
    randomizerGroupId: wd('randomizerGroupId'),
    onlineGame: {
      selectedExpansions: I.List(wdog('selectedExpansions')),
      numPlayers: wdog('numPlayers'),
      roomId: wdog('roomId'),
      communicationId: wdog('communicationId'),
      chatOpened: wdog('chatOpened'),
      cardSizeAutoChange: wdog('cardSizeAutoChange'),
      cardSizeRatio: wdog('cardSizeRatio'),
      messageSec: wdog('messageSec'),
      autoSort: wdog('autoSort'),
    },
  })
}

export const UserToJS = (user: TUser): IUserJS => ({
  key: user.key,
  createdDate: user.createdDate,
  name: user.name,
  randomizerGroupId: user.randomizerGroupId,
  onlineGame: {
    selectedExpansions: user.onlineGame.selectedExpansions.toArray(),
    numPlayers: user.onlineGame.numPlayers,
    roomId: user.onlineGame.roomId,
    communicationId: user.onlineGame.communicationId,
    chatOpened: user.onlineGame.chatOpened,
    cardSizeAutoChange: user.onlineGame.cardSizeAutoChange,
    cardSizeRatio: user.onlineGame.cardSizeRatio,
    messageSec: user.onlineGame.messageSec,
    autoSort: user.onlineGame.autoSort,
  },
})
