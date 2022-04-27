import { api } from '../../api';
import { fetchThrottleTime } from '../../constants';
import { router } from '../router';

export namespace AnswersFetchState {
  const [fetchAnswers$, _fetchAnswers] = createVoidEventEmitter();

  export const fetchAnswers = _fetchAnswers;

  const fetchAnswersThrottled$ = fetchAnswers$.chain(
    throttleTime(fetchThrottleTime)
  );

  const { state$: answersResult$, setState: setAnswersResult } = createState<
    | Result<readonly Answer[], Readonly<{ type: 'others'; message: string }>>
    | undefined
  >(undefined);

  export const result$ = answersResult$;

  export const {
    state$: refreshButtonIsLoading$,
    setState: setRefreshButtonIsLoading,
  } = createState<boolean>(false);

  export const {
    state$: refreshButtonIsDisabled$,
    setState: setRefreshButtonIsDisabled,
  } = createState<boolean>(false);

  export const refreshAnswers = (): void => {
    fetchAnswers();
    setRefreshButtonIsLoading(true);
  };

  /* subscriptions */

  combineLatest([fetchAnswersThrottled$, router.eventId$] as const).subscribe(
    ([_, eventId]) => {
      if (eventId === undefined) return;

      setRefreshButtonIsLoading(true);

      api.answers
        .getList(eventId)
        .then((result) => {
          setAnswersResult(result);
          setRefreshButtonIsLoading(false);
        })
        .catch(noop);
    }
  );

  result$.subscribe((e) => {
    if (Result.isErr(e)) {
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
}

export const answers$: InitializedObservable<readonly Answer[] | undefined> =
  AnswersFetchState.result$
    .chain(filter(isNotUndefined))
    .chain(unwrapResultOk())
    .chain(withInitialValue(undefined));
