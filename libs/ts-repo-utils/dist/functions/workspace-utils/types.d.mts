export type Package = Readonly<{
    name: string;
    path: string;
    packageJson: JsonValue;
    dependencies: ReadonlyRecord<string, string>;
}>;
//# sourceMappingURL=types.d.mts.map