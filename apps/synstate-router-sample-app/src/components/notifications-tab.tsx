import * as React from 'react';

export const NotificationsTab = React.memo(() => (
  <label data-e2e={'notifications-tab'}>
    <input type={'checkbox'} />
    {' Email me'}
  </label>
));

NotificationsTab.displayName = 'NotificationsTab';
