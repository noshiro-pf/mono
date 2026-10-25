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
      <section>
        <h2>{constant('入力値の保存と読み込み')}</h2>
        <p class={constant('note')}>
          {constant(
            '入力値はプランごとにアカウント（Firestore）へ自動で保存される。ここでは開いているプランの入力値を JSON ファイルに書き出したり、JSON ファイルから読み込んで置き換えたりできる。',
          )}
        </p>
        <div class={constant('actions')}>
          <button
            type={constant('button')}
            onClick={() => {
              downloadJson(
                JSON.stringify(input$.getSnapshot().value, undefined, 2),
                'life-plan-simulator-input.json',
              );
            }}
          >
            {constant('JSON ファイルに書き出す')}
          </button>
          <label class={constant('file-button')}>
            {constant('JSON ファイルを読み込む')}
            <input
              type={constant('file')}
              accept={constant('application/json,.json')}
              onChange={(e) => {
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
          </label>
          <If
            cond={confirmingReset$}
            then={
              <span class={constant('actions')}>
                {constant('このプランの入力値をすべて既定値に戻しますか？')}
                <button
                  type={constant('button')}
                  onClick={() => {
                    resetInput();

                    setConfirmingReset(false);

                    setMessage('入力値を既定値に戻しました。');
                  }}
                >
                  {constant('戻す')}
                </button>
                <button
                  type={constant('button')}
                  onClick={() => {
                    setConfirmingReset(false);
                  }}
                >
                  {constant('やめる')}
                </button>
              </span>
            }
            else={
              <button
                type={constant('button')}
                onClick={() => {
                  setConfirmingReset(true);
                }}
              >
                {constant('既定値に戻す')}
              </button>
            }
          />
        </div>
        <p role={constant('status')}>{view(message$, (m) => m)}</p>
      </section>
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
