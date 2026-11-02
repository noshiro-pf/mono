import * as React from 'react';

export const ProfileTab = React.memo(() => (
  <label data-e2e={'profile-tab'}>
    {'Name '}
    <input />
  </label>
));

ProfileTab.displayName = 'ProfileTab';
