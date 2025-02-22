import { Button } from '@blueprintjs/core';
import { CustomIcon } from '../atoms';

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
    const icon = useMemo(
      () => <CustomIcon color={props.iconColor} iconName={props.iconName} />,
      [props.iconColor, props.iconName],
    );

    return (
      <Button
        active={props.active}
        data-e2e={props['data-e2e']}
        icon={icon}
        minimal={true}
        outlined={props.outlined}
        title={props.title}
        onClick={props.onClick}
      />
    );
  },
);
