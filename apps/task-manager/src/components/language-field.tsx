import { constant, derive, If, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import {
  chooseLang,
  isLangChoiceKept,
  lang,
  langAskedByUrl,
  langNames,
  langs,
  langSetting,
  m,
  type LangSetting,
} from '../i18n/index.mjs';
import { projectFileStore, sessionStore } from '../store/index.mjs';

/**
 * The language of the whole page: following the browser, or one of the
 * languages, each under its own name; the pressed one is what decides the page
 * now, the URL's `?lang=` before what is kept. Choosing one keeps it on this
 * device and loads the page again by it (`chooseLang`) — the one pressed too,
 * when only the URL asked for it, so that it is kept. Not while an import is
 * being written or a sign-in or sign-out is under way, which a reload would cut
 * short.
 */
export const LanguageField = (): JSX.Element => (
  <fieldset
    aria-describedby={constant(HINT_ID)}
    class={constant('settings-field')}
  >
    <legend class={constant('settings-field-label')}>
      {constant(m.settings.language)}
    </legend>
    <div class={constant('bp6-button-group')}>
      {choices.map((choice) => (
        <button
          aria-pressed={constant((choice === current).toString())}
          class={constant(
            choice === current ? 'bp6-button bp6-active' : 'bp6-button',
          )}
          data-e2e={constant(`language-${choice}`)}
          disabled={busy}
          lang={constant(choice === 'auto' ? lang : choice)}
          type={constant('button')}
          onClick={() => {
            if (!isLangChoiceKept(choice)) {
              chooseLang(choice);
            }
          }}
        >
          {constant(
            choice === 'auto' ? m.settings.languageAuto : langNames[choice],
          )}
        </button>
      ))}
    </div>
    <p class={constant('settings-hint')} id={constant(HINT_ID)}>
      {constant(m.settings.languageHint)}
    </p>
    <If
      cond={projectFileStore.importing}
      then={
        <p class={constant('settings-hint')} role={constant('status')}>
          {constant(m.projectFile.languageWhileImporting)}
        </p>
      }
    />
  </fieldset>
);

/** While a reload would cut something short. */
const busy = derive(
  [projectFileStore.importing, sessionStore.session, sessionStore.signOutState],
  (importing, session, signOut) =>
    importing ||
    (session.type === 'signed-out' && session.signingIn) ||
    signOut !== 'idle',
);

const choices: readonly LangSetting[] = Arr.toUnshifted('auto')(langs);

/** What decides the language now. */
const current: LangSetting = langAskedByUrl ?? langSetting;

const HINT_ID = 'language-hint';
