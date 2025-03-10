import { notificationSettingsWithEmailDefaultValue } from '../../constants';
import { type NotificationSettingsWithEmail } from '../../types';
import { AnswerDeadlineDatepicker } from './answer-deadline';
import { AnswerIconSettingsComponent } from './icon-settings';
import { NotificationSettingsComponent } from './notification-settings';
import { ParagraphWithSwitch } from './paragraph-with-switch';

const dc = dict.eventSettingsPage.section3;

type Props = Readonly<{
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: Ymdhm | undefined;
  onAnswerDeadlineChange: (value: Ymdhm | undefined) => void;
  answerIcons: AnswerIconSettings;
  onAnswerIconsChange: (value: AnswerIconSettings) => void;
  useNotification: boolean;
  onToggleUseNotification: () => void;
  notificationSettingsWithEmail: NotificationSettingsWithEmail | undefined;
  onNotificationSettingsWithEmailChange: (
    value: NotificationSettingsWithEmail,
  ) => void;
}>;

export const EventSettings = memoNamed<Props>(
  'EventSettings',
  ({
    useAnswerDeadline,
    onToggleAnswerDeadline,
    answerDeadline,
    onAnswerDeadlineChange,
    answerIcons,
    onAnswerIconsChange,
    useNotification,
    onToggleUseNotification,
    notificationSettingsWithEmail,
    onNotificationSettingsWithEmailChange,
  }) => {
    const focusEmailInput$ = useTinyObservable<undefined>();

    const [clickedMoreThanOnce, { setTrue: setClickedMoreThanOnce }] =
      useBoolState(false);

    const onToggleUseNotificationLocal = useCallback(() => {
      onToggleUseNotification();
      setClickedMoreThanOnce();
    }, [onToggleUseNotification, setClickedMoreThanOnce]);

    useEffect(() => {
      if (useNotification && clickedMoreThanOnce) {
        focusEmailInput$.next(undefined);
      }
    }, [useNotification, focusEmailInput$, clickedMoreThanOnce]);

    const answerDeadlineDatepicker = useMemo(
      () => (
        <AnswerDeadlineDatepicker
          answerDeadline={answerDeadline}
          useAnswerDeadline={useAnswerDeadline}
          onAnswerDeadlineChange={onAnswerDeadlineChange}
        />
      ),
      [answerDeadline, onAnswerDeadlineChange, useAnswerDeadline],
    );

    const notificationSettingsComponent = useMemo(
      () => (
        <NotificationSettingsComponent
          answerDeadline={answerDeadline}
          disabled={!useNotification}
          focusEmailInput$={focusEmailInput$}
          notificationSettingsWithEmail={
            notificationSettingsWithEmail ??
            notificationSettingsWithEmailDefaultValue
          }
          useAnswerDeadline={useAnswerDeadline}
          onNotificationSettingsWithEmailChange={
            onNotificationSettingsWithEmailChange
          }
        />
      ),
      [
        answerDeadline,
        focusEmailInput$,
        notificationSettingsWithEmail,
        onNotificationSettingsWithEmailChange,
        useAnswerDeadline,
        useNotification,
      ],
    );

    return (
      <div
        css={css`
          padding: 10px;
          & > * {
            margin-bottom: 15px;
          }
        `}
      >
        <ParagraphWithSwitch
          description={dc.answerDeadline.howAnswerDeadlineIsUsed}
          elementToToggle={answerDeadlineDatepicker}
          hideContentIfToggleIsFalse={false}
          title={dc.answerDeadline.title}
          toggleState={useAnswerDeadline}
          onToggle={onToggleAnswerDeadline}
        />
        <hr />
        <ParagraphWithSwitch
          description={dc.notification.description}
          elementToToggle={notificationSettingsComponent}
          hideContentIfToggleIsFalse={false}
          title={dc.notification.useNotification}
          toggleState={useNotification}
          onToggle={onToggleUseNotificationLocal}
        />
        <hr />
        <AnswerIconSettingsComponent
          answerIcons={answerIcons}
          onAnswerIconsChange={onAnswerIconsChange}
        />
      </div>
    );
  },
);
