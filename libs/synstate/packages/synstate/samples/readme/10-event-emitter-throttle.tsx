import { createEventEmitter, throttleTime } from 'synstate';

// Create event emitter
const [refreshClicked, onRefreshClick] = createEventEmitter();

// Subscribe to events
refreshClicked.subscribe(() => {
  console.log('Refresh Clicked');
});

// Throttle refresh clicks to prevent rapid successive executions
const throttledRefresh = refreshClicked.pipe(throttleTime(2000));

throttledRefresh.subscribe(() => {
  console.log('Executing refresh...');
  // Actual refresh logic here
  // This will be called at most once every 2 seconds
});

const DataTable = (): React.JSX.Element => (
  <div>
    <button onClick={onRefreshClick}>{'Refresh'}</button>
    <p>
      {'Data: '}
      {/* Display data here */}
    </p>
  </div>
);

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(DataTable);
