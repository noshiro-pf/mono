import { memoNamed } from 'preact-utils';
import { Arr } from 'ts-data-forge';
import { milestoneRowsSignal } from '../store/index.mjs';
import { MilestoneItem } from './milestone-item.js';

export const MilestoneSection = memoNamed('MilestoneSection', () => {
  const rows = milestoneRowsSignal.value;

  return (
    <section aria-labelledby={HEADING_ID} className={'list-section'}>
      <div className={'section-header'}>
        <h2 className={'section-title'} id={HEADING_ID}>
          {'マイルストーン'}
        </h2>
      </div>
      {Arr.isEmpty(rows) ? (
        <p className={'bp6-text-muted'}>
          {'マイルストーンはありません。「＋マイルストーン」から追加できます。'}
        </p>
      ) : (
        <ul className={'milestone-list'}>
          {rows.map((row) => (
            <MilestoneItem key={row.milestone.id} row={row} />
          ))}
        </ul>
      )}
    </section>
  );
});

const HEADING_ID = 'milestones-heading';
