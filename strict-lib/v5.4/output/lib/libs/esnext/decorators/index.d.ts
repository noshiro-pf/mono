/// <reference no-default-lib="true"/>

/// <reference lib="es2015.symbol" />
/// <reference lib="decorators" />

interface SymbolConstructor {
  readonly metadata: unique symbol;
}

interface Function {
  readonly [Symbol.metadata]: DecoratorMetadata | null;
}
