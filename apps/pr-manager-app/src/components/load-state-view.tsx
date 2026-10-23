import { constant, If, MatchOptional, view, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { reader } from '../store/index.mjs';
import { Notice } from './notice.js';
import { ReportView } from './report-view.js';

/** What the status says, once there is a token to have read with. */
export const LoadStateView = (): JSX.Element => (
  <If
    cond={view(reader.loadStatus, (status) => status.type === 'ready')}
    then={<ReportView />}
    else={
      <MatchOptional
        value={view(reader.loadStatus, (status) =>
          status.type === 'failed'
            ? Optional.some(status.message)
            : Optional.none,
        )}
        some={(message$) => <Notice tone={'critical'}>{message$}</Notice>}
        none={<Notice tone={'neutral'}>{constant('Reading GitHub…')}</Notice>}
      />
    }
  />
);
