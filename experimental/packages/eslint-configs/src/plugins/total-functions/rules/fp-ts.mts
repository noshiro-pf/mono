import { type Type } from 'typescript';
import { typeSymbolName } from './common.mjs';

// Note: `Lazy` deliberately excluded even though it has the same signature as `IO`, its semantics
// don't imply impurity like IO.
export const effects: readonly string[] = [
  'IO',
  'IOEither',
  'IOOption',
  'ReaderTask',
  'ReaderTaskEither',
  'StateReaderTaskEither',
  'Task',
  'TaskEither',
  'TaskOption',
  'TaskThese',
] as const;

export type FpTsEffectType = Readonly<{
  effectType: Type;
  effectName: string;
  effectTypeParameter: Type | undefined;
}>;

const fpTsEffectTypeParameter = (
  effectName: string,
  effectType: Type,
): Type | undefined => {
  if (effectName === 'IO') {
    const signatures = effectType.getCallSignatures();
    const signature = signatures[0];

    if (signatures.length !== 1 || signature === undefined) {
      return undefined;
    }

    return signature.getReturnType();
  }

  // TODO extract the type param from other effect types.
  return undefined;
};

export const fpTsEffectType = (type: Type): FpTsEffectType | undefined => {
  const symbolName = typeSymbolName(type);

  if (symbolName === undefined || !effects.includes(symbolName)) {
    return undefined;
  }

  return {
    effectType: type,
    effectName: symbolName,
    effectTypeParameter: fpTsEffectTypeParameter(symbolName, type),
  } as const;
};
