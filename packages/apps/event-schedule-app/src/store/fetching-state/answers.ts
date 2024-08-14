import { api } from '../../api';
import { fetchThrottleTime } from '../../constants';
import { Router } from '../router';

const [fetchAnswers$, fetchAnswers] = createVoidEventEmitter();

const fetchAnswersThrottled$ = fetchAnswers$.chain(
  throttleTime(fetchThrottleTime),
);

const { state: answersResult$, setState: setAnswersResult } = createState<
  | Result<readonly Answer[], Readonly<{ type: 'others'; message: string }>>
  | undefined
>(undefined);

const result$ = answersResult$;

const { state: refreshButtonIsLoading$, setState: setRefreshButtonIsLoading } =
  createBooleanState(false);

const {
  state: refreshButtonIsDisabled$,
  setState: setRefreshButtonIsDisabled,
} = createBooleanState(false);

const refreshAnswers = (): void => {
  fetchAnswers();
  setRefreshButtonIsLoading(true);
};

/* subscriptions */

combine([fetchAnswersThrottled$, Router.eventId$] as const).subscribe(
  ([_, eventId]) => {
    if (eventId === undefined) return;

    setRefreshButtonIsLoading(true);

    api.answers
      .fetchList(eventId)
      .then((result) => {
        setAnswersResult(result);
        setRefreshButtonIsLoading(false);
      })
      .catch(noop);
  },
);

result$.subscribe((e) => {
  if (e !== undefined && Result.isErr(e)) {
    // TODO: use toast
    console.error('answersResult', e.value);
  }
});

{
  let mut_timer: TimerId | undefined = undefined;
  fetchAnswersThrottled$.subscribe(() => {
    if (mut_timer !== undefined) {
      clearTimeout(mut_timer);
    }
    setRefreshButtonIsDisabled(true);
    mut_timer = setTimeout(() => {
      setRefreshButtonIsDisabled(false);
    }, fetchThrottleTime);
  });
}

const answers$: InitializedObservable<readonly Answer[] | undefined> = result$
  .chain(filter(isNotUndefined))
  .chain(unwrapResultOk())
  .chain(setInitialValue(undefined));

export const AnswersStore = {
  answers$,
  result$,
  refreshButtonIsDisabled$,
  refreshButtonIsLoading$,
  fetchAnswers,
  refreshAnswers,
} as const;
