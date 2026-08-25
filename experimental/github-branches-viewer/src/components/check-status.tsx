import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type GitHubCheckRun } from '../types';
import './check-status.css';

type ChecksSummary = Readonly<{
  total: number;
  passing: number;
  failing: number;
  pending: number;
  successful?: number;
  failed?: number;
  runs: readonly GitHubCheckRun[];
}>;

type CheckStatusProps = Readonly<{
  checks?: ChecksSummary;
  checkStatus?: string;
}>;

const STATUS_ICONS: Record<string, string> = {
  failure: '✗',
  pending: '⋯',
  success: '✓',
};

const CHECKS_HEADING = 'Checks';
const CLOSE_LABEL = '✕';
const VIEW_DETAILS_LABEL = 'View details';
const ALL_CHECKS_PASSED_MESSAGE = 'All checks have passed';

const EMPTY_CHECKS: ChecksSummary = {
  failing: 0,
  failed: 0,
  pending: 0,
  passing: 0,
  runs: [],
  successful: 0,
  total: 0,
};

const getStatusIcon = (statusValue: string | undefined): string =>
  STATUS_ICONS[statusValue ?? ''] ?? '—';

const formatStatusText = (
  conclusion: GitHubCheckRun['conclusion'],
  statusValue: GitHubCheckRun['status'],
): string => {
  if (conclusion !== null) {
    return `${conclusion.charAt(0).toUpperCase()}${conclusion.slice(1)}`;
  }
  return `${statusValue.charAt(0).toUpperCase()}${statusValue.slice(1)}`;
};

const formatDuration = (
  startedAt: GitHubCheckRun['started_at'],
  completedAt: GitHubCheckRun['completed_at'],
): string => {
  if (startedAt === undefined) {
    return '';
  }
  if (completedAt === undefined) {
    return 'Running...';
  }

  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const durationSeconds = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 1000),
  );

  if (durationSeconds < 60) {
    return `${durationSeconds}s`;
  }
  if (durationSeconds < 3_600) {
    return `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`;
  }
  return `${Math.floor(durationSeconds / 3_600)}h ${Math.floor(
    (durationSeconds % 3_600) / 60,
  )}m`;
};

export const CheckStatus = memo<CheckStatusProps>((props) => {
  const { checks, checkStatus } = props;
  const safeChecks = checks ?? EMPTY_CHECKS;
  const hasChecks = safeChecks.total > 0;

  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);

  const successfulChecks = safeChecks.successful ?? safeChecks.passing;
  const failedChecks = safeChecks.failed ?? safeChecks.failing;
  const statusModifier =
    checkStatus !== undefined && checkStatus.trim() !== ''
      ? `checks-${checkStatus}`
      : 'checks-unknown';

  const summaryClassName = useMemo(
    () => `check-summary ${statusModifier}`,
    [statusModifier],
  );

  const summaryTitle = useMemo(
    () => `${successfulChecks}/${safeChecks.total} checks passing`,
    [safeChecks.total, successfulChecks],
  );

  const toggleDetails = useCallback(() => {
    setIsOpen((previous) => !previous);
  }, []);

  const closeDetails = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (pointerEvent: PointerEvent): void => {
      const referenceElement = buttonRef.current;
      const floatingElement = detailsRef.current;
      const target = pointerEvent.target;

      if (
        referenceElement !== null &&
        floatingElement !== null &&
        target instanceof Node &&
        !referenceElement.contains(target) &&
        !floatingElement.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (keyboardEvent: KeyboardEvent): void => {
      if (keyboardEvent.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const summaryInfo = useMemo(() => {
    if (failedChecks > 0) {
      return {
        className: 'check-summary-info failure',
        message: `${failedChecks} failing, ${successfulChecks} successful, ${safeChecks.pending} pending`,
      };
    }
    if (safeChecks.pending > 0) {
      return {
        className: 'check-summary-info pending',
        message: `${successfulChecks} successful, ${safeChecks.pending} pending`,
      };
    }
    return {
      className: 'check-summary-info success',
      message: ALL_CHECKS_PASSED_MESSAGE,
    };
  }, [failedChecks, safeChecks.pending, successfulChecks]);

  if (!hasChecks) {
    return null;
  }

  return (
    <div className={'check-status'}>
      <button
        ref={buttonRef}
        className={summaryClassName}
        title={summaryTitle}
        type={'button'}
        onClick={toggleDetails}
      >
        <span className={'check-icon'}>{getStatusIcon(checkStatus)}</span>
        <span className={'check-count'}>
          {safeChecks.successful ?? safeChecks.passing}
          <span aria-hidden={'true'} className={'check-count-separator'}>
            {'/'}
          </span>
          {safeChecks.total}
        </span>
      </button>

      {isOpen ? (
        <div ref={detailsRef} className={'check-details'}>
          <div className={'check-details-header'}>
            <h4>{CHECKS_HEADING}</h4>
            <button
              className={'check-details-close'}
              type={'button'}
              onClick={closeDetails}
            >
              {CLOSE_LABEL}
            </button>
          </div>

          <div className={'check-runs-list'}>
            {safeChecks.runs.map((run) => (
              <div key={run.id} className={'check-run-item'}>
                <div className={'check-run-main'}>
                  <span
                    className={`check-run-icon status-${run.conclusion ?? run.status}`}
                  >
                    {getStatusIcon(run.conclusion ?? run.status)}
                  </span>
                  <div className={'check-run-info'}>
                    <div className={'check-run-name'}>{run.name}</div>
                    <div className={'check-run-status'}>
                      {formatStatusText(run.conclusion, run.status)}
                      {run.started_at !== undefined ? (
                        <span className={'check-run-duration'}>
                          {'— '}
                          {formatDuration(run.started_at, run.completed_at)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                {run.html_url !== '' ? (
                  <a
                    className={'check-run-link'}
                    href={run.html_url}
                    rel={'noopener noreferrer'}
                    target={'_blank'}
                  >
                    {VIEW_DETAILS_LABEL}
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          <div className={summaryInfo.className}>{summaryInfo.message}</div>
        </div>
      ) : null}
    </div>
  );
});

CheckStatus.displayName = 'CheckStatus';
