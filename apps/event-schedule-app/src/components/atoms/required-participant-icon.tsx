import { Icon } from '@blueprintjs/core';
import { memoNamed } from 'react-utils';

const iconSize = 12;

export const RequiredParticipantIcon = memoNamed(
  'RequiredParticipantIcon',
  () => <Icon icon={'star'} intent={'primary'} size={iconSize} />,
);
