/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/// <reference lib="es2015.symbol" />
/// <reference lib="decorators" />

interface SymbolConstructor {
  readonly metadata: unique symbol;
}

interface Function {
  readonly [Symbol.metadata]: DecoratorMetadata | null;
}
