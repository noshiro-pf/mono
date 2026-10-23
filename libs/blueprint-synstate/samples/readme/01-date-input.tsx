import { DateInput } from 'blueprint-synstate';
import { createState } from 'synstate';
import { render } from 'synstate-dom';

// `YYYY-MM-DDTHH:mm`, as `<input type="datetime-local">` holds it; '' for none.
const [due$, setDue] = createState('');

const unmount = render(
  () => (
    <DateInput
      clearButtonText={'クリア'}
      locale={'ja'}
      placeholder={'日時を選ぶ'}
      showActionsBar
      timePickerProps={{ showArrowButtons: true }}
      timePrecision={'minute'}
      todayButtonText={'今日'}
      value={due$}
      onChange={setDue}
    />
  ),
  document.body,
);

// Later: closes the calendar if it is open, and removes everything.
unmount();
