import { Button, Card, FileInput } from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { Result } from 'ts-data-forge';
import { importInput, input$, resetInput } from '../../store/index.mjs';

/**
 * 開いているプランの入力値の書き出しと読み込み。入力値はアカウントに自動で
 * 保存されるので、ここはバックアップや、ほかのプランへ写すためのもの。
 */
export const DataTab = (): JSX.Element => {
  const [message$, setMessage] = createState('');

  const [confirmingReset$, setConfirmingReset] = createState(false);

  const loadFile = async (file: File): Promise<void> => {
    const result = importInput(await file.text());

    setMessage(
      Result.isOk(result)
        ? `${file.name} を読み込みました。`
        : `${file.name} を読み込めませんでした: ${result.value}`,
    );
  };

  return (
    <div class={constant('tab-body')}>
      <Card>
        <h2 class={constant('bp6-heading')}>
          {constant('入力値の保存と読み込み')}
        </h2>
        <p class={constant('bp6-text-muted note')}>
          {constant(
            '入力値はプランごとにアカウント（Firestore）へ自動で保存される。ここでは開いているプランの入力値を JSON ファイルに書き出したり、JSON ファイルから読み込んで置き換えたりできる。',
          )}
        </p>
        <div class={constant('actions')}>
          <Button
            icon={'export'}
            text={constant('JSON ファイルに書き出す')}
            onClick={() => {
              downloadJson(
                JSON.stringify(input$.getSnapshot().value, undefined, 2),
                'life-plan-simulator-input.json',
              );
            }}
          />
          <FileInput
            accept={'application/json,.json'}
            aria-label={constant('JSON ファイルを読み込む')}
            buttonText={'選ぶ'}
            text={constant('JSON を読み込む…')}
            onInputChange={(e) => {
              const file = e.currentTarget.files?.[0];

              if (file !== undefined) {
                loadFile(file).catch((error: unknown) => {
                  setMessage(
                    `${file.name} を読み込めませんでした: ${String(error)}`,
                  );
                });
              }
            }}
          />
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
        <p role={constant('status')}>{view(message$, (m) => m)}</p>
      </Card>
    </div>
  );
};

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
