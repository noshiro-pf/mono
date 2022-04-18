import { CustomIcon } from '../../atoms';
import { BpInput } from '../../bp';
import {
  AnswerIconFairPointInput,
  AnswerIconGoodPoint,
  AnswerIconPoorPoint,
} from '../../molecules';

type Props = Readonly<{
  iconId: AnswerIconId;
  answerIcon: AnswerIconSetting;
  onDescriptionChange: (value: string) => void;
  onPointChange: (value: AnswerIconPoint) => void;
}>;

export const AnswerIconRow = memoNamed<Props>(
  'AnswerIconRow',
  ({ iconId, answerIcon, onDescriptionChange, onPointChange }) => (
    <Root>
      <IconWrapper>
        <CustomIcon iconName={iconId} />
      </IconWrapper>
      <DescriptionWrapper>
        <BpInput
          value={answerIcon.description}
          onValueChange={onDescriptionChange}
        />
      </DescriptionWrapper>
      <NumericInputWrapper>
        {match(iconId, {
          good: <AnswerIconGoodPoint />,
          poor: <AnswerIconPoorPoint />,
          fair: (
            <AnswerIconFairPointInput
              disabled={false}
              value={answerIcon.point}
              onValueChange={onPointChange}
            />
          ),
        })}
      </NumericInputWrapper>
    </Root>
  )
);

const Root = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: 5px;
  justify-content: flex-start;

  & > * {
    margin-right: 3px;
  }
`;

const IconWrapper = styled.div`
  flex: 0;
  padding: 0 5px;
`;
const DescriptionWrapper = styled.div`
  flex: 2 2;
  min-width: 92px;
  max-width: 300px;
`;

const NumericInputWrapper = styled.div`
  flex: 0 0 75px;
`;
