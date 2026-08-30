import { Button } from '@blueprintjs/core';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { CustomIcon } from '../atoms/index.mjs';

type Props = Readonly<{
  active?: boolean;
  'data-e2e'?: string;
  iconName: AnswerIconIdWithNone;
  outlined?: boolean;
  iconColor?: string;
  title: string;
  onClick: () => void;
}>;

export const CustomIconButton = memoNamed<Props>(
  'CustomIconButton',
  (props) => {
    const icon = React.useMemo(
      () => <CustomIcon color={props.iconColor} iconName={props.iconName} />,
      [props.iconColor, props.iconName],
    );

    return (
      <Button
        active={props.active}
        data-e2e={props['data-e2e']}
        icon={icon}
        title={props.title}
        variant={props.outlined === true ? 'outlined' : 'minimal'}
        onClick={props.onClick}
      />
    );
  },
);
