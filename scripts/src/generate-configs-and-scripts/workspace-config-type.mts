// TODO: 整理する
export type WorkspaceConfig = DeepReadonly<
  (
    | {
        // utils なら package.json の files を定義する
        utilOrApp: 'utils';

        // config やコマンドを生成するかどうか
        gen: {
          typeCheck: boolean;
          build: boolean;
          test: boolean;
          lint: boolean;
        };
      }
    | {
        // utils なら package.json の files を定義する
        utilOrApp: 'app';

        // config やコマンドを生成するかどうか
        gen: {
          typeCheck: boolean;
          build: boolean;
          test: boolean;
          lint: boolean;
          e2e: 'playwright';
        };
      }
  ) & {
    // tsconfig や eslint config の定義に用いる
    tsType: 'dom' | 'mts' | 'preact' | 'react-emotion' | 'react' | undefined;

    // 使用する tsconfig の指定に用いる
    // FIXME: 一部 util か app かの判定に使用してしまっているので、 utilOrApp と併せて修正する
    useVite: boolean | 'vitest-only';

    // tsconfig の includes や コマンドラインのディレクトリ指定に使用（ほぼ ['src']）
    srcDirs: string[];

    // 型チェック用 tsconfig の includes 指定
    typeCheckIncludes: string[];

    // tsconfig.compilerOptions を特別に指定する場合の定義
    tsconfig?: {
      compilerOptions: UnknownRecord;
    };

    // package.json の scripts の記述に使用するパラメータ定義
    packageJson: {
      scripts: {
        gi: 0 | 1 | 2 | 3 | false;
        giIgnore?: string[];
        publish: boolean;
        passWithNoTests?: true;
        lint?: false;
        e2e?: 'playwright';
      };
    };
  }
>;
