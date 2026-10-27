import { Button, Card, FileInput } from 'blueprint-synstate';
import { createState, type InitializedObservable } from 'synstate';
import { constant, For, If, view, type JSX } from 'synstate-dom';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { planFileSchemaUrl } from '../../repository/index.mjs';
import {
  exportCurrentPlan,
  importAsNewPlan,
  importIntoCurrentPlan,
  resetInput,
} from '../../store/index.mjs';

/**
 * 開いているプランの書き出しと読み込み。入力値はアカウントに自動で保存される
 * ので、ここはバックアップや、ほかで用意した値を取り込むためのもの。
 */
export const DataTab = (): JSX.Element => {
  const [message$, setMessage] = createState('');

  const [warnings$, setWarnings] = createState<readonly string[]>([]);

  const [confirmingReset$, setConfirmingReset] = createState(false);

  const loadFile = async (
    file: File,
    load: (json: string) => Result<readonly string[], string>,
  ): Promise<void> => {
    const result = load(await file.text());

    if (Result.isOk(result)) {
      setMessage(
        Arr.isEmpty(result.value)
          ? `${file.name} を読み込みました。`
          : `${file.name} を読み込みました。次の値は無いか読めなかったので既定値にしました:`,
      );

      setWarnings(result.value);
    } else {
      setMessage(`${file.name} を読み込めませんでした: ${result.value}`);

      setWarnings([]);
    }
  };

  const fileInput = (
    label: string,
    e2e: string,
    load: (json: string) => Result<readonly string[], string>,
  ): JSX.Element => (
    <FileInput
      accept={'application/json,.json'}
      aria-label={constant(label)}
      buttonText={'選ぶ'}
      data-e2e={constant(e2e)}
      text={constant(`${label}…`)}
      onInputChange={(e) => {
        const input = e.currentTarget;

        const file = input.files?.[0];

        if (file !== undefined) {
          loadFile(file, load)
            .catch((error: unknown) => {
              setMessage(
                `${file.name} を読み込めませんでした: ${unknownToString(error)}`,
              );
            })
            .finally(() => {
              // So that choosing the same file again fires `change` again.
              // A file input is cleared only by assigning to it.
              // eslint-disable-next-line functional/immutable-data
              input.value = '';
            });
        }
      }}
    />
  );

  return (
    <div class={constant('tab-body')}>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('プランのファイル')}</h2>
        <p class={constant('bp6-text-muted note')}>
          {constant(
            '入力値はプランごとにアカウント（Firestore）へ自動で保存される。ここでは開いているプランを、名前と入力値を持つ JSON ファイルに書き出したり、JSON ファイルから読み込んだりできる。読めない値や欠けている値は既定値で補う。',
          )}
        </p>
        <p class={constant('bp6-text-muted note')}>
          {constant(
            'ファイルの形は JSON Schema で公開している。書き出したファイルはその URL を $schema に持つので、対応するエディタで開くと入力値が補完・検査される: ',
          )}
          <a href={constant(planFileSchemaUrl)}>
            {constant('plan-file.schema.json')}
          </a>
        </p>
        <div class={constant('actions')}>
          <Button
            icon={'export'}
            text={constant('ファイルに書き出す')}
            data-e2e={constant('plan-export')}
            onClick={() => {
              const file = exportCurrentPlan();

              if (file !== undefined) {
                downloadJson(file.json, file.fileName);
              }
            }}
          />
          {fileInput(
            '新しいプランとして読み込む',
            'plan-import-new',
            importAsNewPlan,
          )}
          {fileInput(
            '開いているプランの入力値を置き換える',
            'plan-import-current',
            importIntoCurrentPlan,
          )}
        </div>
        <div role={constant('status')}>
          <p>{view(message$, (m) => m)}</p>
          <WarningList warnings$={warnings$} />
        </div>
      </Card>
      <Card>
        <h2 class={constant('bp6-heading')}>{constant('既定値に戻す')}</h2>
        <div class={constant('actions')}>
          <If
            cond={confirmingReset$}
            then={
              <span class={constant('actions')}>
                {constant('このプランの入力値をすべて既定値に戻しますか？')}
                <Button
                  intent={'danger'}
                  text={constant('戻す')}
                  onClick={() => {
                    resetInput();

                    setConfirmingReset(false);

                    setMessage('入力値を既定値に戻しました。');
                  }}
                />
                <Button
                  text={constant('やめる')}
                  onClick={() => {
                    setConfirmingReset(false);
                  }}
                />
              </span>
            }
            else={
              <Button
                intent={'danger'}
                variant={constant('outlined')}
                text={constant('既定値に戻す')}
                onClick={() => {
                  setConfirmingReset(true);
                }}
              />
            }
          />
        </div>
      </Card>
    </div>
  );
};

const WarningList = ({
  warnings$,
}: Readonly<{
  warnings$: InitializedObservable<readonly string[]>;
}>): JSX.Element => (
  <ul data-e2e={constant('plan-import-warnings')}>
    <For items={warnings$} key={(_, i) => i}>
      {(w$) => <li>{view(w$, (w) => w)}</li>}
    </For>
  </ul>
);

const downloadJson = (json: string, fileName: string): void => {
  const url = URL.createObjectURL(
    new Blob([json], { type: 'application/json' }),
  );

  const a = document.createElement('a');

  a.setAttribute('href', url);

  a.setAttribute('download', fileName);

  a.click();

  URL.revokeObjectURL(url);
};
