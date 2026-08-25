import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { type RateLimit } from '../types';
import { checkRateLimit } from '../utils';
import './rate-limit-status.css';

export const RateLimitStatus = memo(() => {
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const isMountedRef = useRef(true);

  const toggleDetails = useCallback(() => {
    setShowDetails((previous) => !previous);
  }, []);

  useEffect(() => {
    const fetchRateLimit = async (): Promise<void> => {
      const limit = await checkRateLimit();
      if (!isMountedRef.current || limit === null) {
        return;
      }
      setRateLimit(limit);
      if (limit.remaining < 10) {
        setShowDetails(true);
      }
    };

    fetchRateLimit().catch(() => {});
    const intervalId = globalThis.setInterval(() => {
      fetchRateLimit().catch(() => {});
    }, 30_000);

    return () => {
      isMountedRef.current = false;
      globalThis.clearInterval(intervalId);
    };
  }, []);

  if (rateLimit === null) {
    return null;
  }

  const resetTime = new Date(rateLimit.reset * 1000);
  const normalizedLimit = Math.max(rateLimit.limit, 1);
  const isLow =
    rateLimit.limit !== 0 && rateLimit.remaining * 5 < rateLimit.limit;
  const progressStyle = {
    '--rate-limit-remaining': rateLimit.remaining,
    '--rate-limit-total': normalizedLimit,
  } as const;

  return (
    <div className={'rate-limit-status'}>
      <button
        className={'rate-limit-toggle'}
        title={'GitHub API Rate Limit'}
        type={'button'}
        onClick={toggleDetails}
      >
        <span className={`rate-indicator ${isLow ? 'low' : 'normal'}`}>
          {rateLimit.remaining}
          {'/'}
          {rateLimit.limit}
        </span>
      </button>

      {showDetails ? (
        <div className={'rate-limit-details'}>
          <h3>{'GitHub API Rate Limit'}</h3>
          <div className={'rate-info'}>
            <div className={'rate-bar'}>
              <div className={'rate-bar-fill'} style={progressStyle} />
            </div>
            <p>
              <strong>{rateLimit.remaining}</strong>
              {' of'} <strong>{rateLimit.limit}</strong> {'requests remaining'}
            </p>
            <p className={'reset-time'}>
              {'Resets at '}
              {resetTime.toLocaleTimeString()}
            </p>
            {isLow ? (
              <div className={'rate-warning'}>
                {
                  '⚠️ Rate limit is low. Consider adding a GitHub token to increase'
                }
                {'limits.'}
                <br />
                <small>{'See .env.example for instructions'}</small>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
});

RateLimitStatus.displayName = 'RateLimitStatus';
