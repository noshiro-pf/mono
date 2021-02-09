import { RN } from '../RN';

export type RNValue<S> = S extends RN<infer T> ? T : never;
export type ArrayElement<S> = S extends Array<infer T> ? T : never;

export type Unwrap<S> = { [P in keyof S]: RNValue<S[P]> };

export function unwrapCurr<T extends RN<any>[]>( ...rns: T ): Unwrap<T> {
  return rns.map( e => e.value ) as Unwrap<T>;
}

export function applyMixins( derivedCtor: any, baseCtors: any[] ) {
  baseCtors.forEach( baseCtor => {
    Object.getOwnPropertyNames( baseCtor.prototype ).forEach( name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}

// export function cancelableSleep( time: number ): [Promise<void>, () => void] {
//   let timerId: any;
//   let reject: () => void;

//   const promise = new Promise<void>( (res, rej) => {
//     timerId = setTimeout( res, time );
//     reject = rej;
//   } );

//   const cancel = () => {
//     clearTimeout( timerId );
//     reject();
//   };

//   return [promise, cancel];
// }
