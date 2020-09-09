import { withDefault } from 'typescript-utils/functions/with-default'

export interface IUser {
  id: string
  timestamp: number
  name: string
  data: { a: number; b: number }
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface IUserPartial extends Partial<Omit<IUser, 'data'>> {
  data?: {
    a?: number
    b?: number
  }
}

const defaultValues = (): IUser => ({
  id: '',
  timestamp: Date.now(),
  name: '',
  data: { a: 0, b: 0 }
})

export class User implements IUser {
  id: string
  timestamp: number
  name: string
  data: { a: number; b: number }

  constructor(init: IUserPartial = defaultValues()) {
    const dfl = defaultValues()

    const wd = withDefault(init as any, defaultValues())
    this.id = wd('id')
    this.timestamp = wd('timestamp')
    this.name = wd('name')
    this.data = wd('data')

    const wdData = withDefault(wd('data'), dfl.data)
    this.data = {
      a: wdData('a'),
      b: wdData('b')
    }
  }
}
