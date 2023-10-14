import { Icon } from '@blueprintjs/core';

const iconSize = 12;

export const RequiredParticipantIcon = memoNamed(
  'RequiredParticipantIcon',
  () => <Icon icon='star' intent='primary' size={iconSize} />,
);
