/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface RegExpMatchArray {
  readonly groups?: {
    readonly [key: string]: string;
  };
}

interface RegExpExecArray {
  readonly groups?: {
    readonly [key: string]: string;
  };
}

interface RegExp {
  /**
   * Returns a Boolean value indicating the state of the dotAll flag (s) used with a regular expression.
   * Default is false. Read-only.
   */
  readonly dotAll: boolean;
}
