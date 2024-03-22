/* cSpell:disable */
import { type RoomRemote } from '../types';

export const firebaseConfig = {
  apiKey: 'AIzaSyByaJQ8zGWuneOAl5ZzFP1uWL3lJK2tYgk',
  authDomain: 'algo-app-45270.firebaseapp.com',
  projectId: 'algo-app-45270',
  storageBucket: 'algo-app-45270.appspot.com',
  messagingSenderId: '380574368956',
  appId: '1:380574368956:web:706cfd949d32109d4a7cb9',
  measurementId: 'G-QWBD5Y044Q',
} as const;

export const firestorePaths = {
  rooms: 'rooms',
  actions: 'actions',
  players: 'players',
  shuffleDef: 'shuffleDef',
  state: 'state',
} as const;

type ShuffleDefKey = typeof firestorePaths.shuffleDef;
type StateKey = typeof firestorePaths.state;

expectType<ShuffleDefKey, keyof RoomRemote>('<=');
expectType<StateKey, keyof RoomRemote>('<=');
