import { Button, TextArea } from '@blueprintjs/core';
import {
  BpInput,
  BpSelect,
  BpSwitch,
  BpTimePicker,
} from '@noshiro/react-blueprintjs-utils';
import { clog } from '../../utils';
import {
  CalendarIcon,
  CircleIcon,
  CloseIcon,
  CommentIcon,
  DeleteIcon,
  EditIcon,
  TriangleIcon,
} from '../atoms';

const size: React.CSSProperties = { width: '32px', height: '32px' };

const options: Readonly<HTMLSelectProps['options']> = [
  { value: '', label: 'select...' },
  { value: 0, label: 'aaa' },
  { value: 1, label: 'bbb' },
];

export const UiPartsTest = memoNamed('UiPartsTest', () => {
  const [inputValue, setInputValue] = useState<string>('');

  const [bpSwitchState, { toggleState: onBpSwitchChangeHandler }] =
    useBoolState(false);

  return (
    <div>
      <div>
        <IconWrapper>
          <CircleIcon color={'black'} style={size} />
        </IconWrapper>
        <IconWrapper>
          <TriangleIcon color={'red'} style={size} />
        </IconWrapper>
        <IconWrapper>
          <CloseIcon color={'blue'} style={size} />
        </IconWrapper>
        <IconWrapper>
          <EditIcon color={'lightblue'} style={size} />
        </IconWrapper>
        <IconWrapper>
          <DeleteIcon color={'gray'} style={size} />
        </IconWrapper>
        <IconWrapper>
          <CommentIcon color={'green'} style={size} />
        </IconWrapper>
        <IconWrapper>
          <CalendarIcon color={'purple'} style={size} />
        </IconWrapper>
      </div>
      <PadWrapper>
        <BpInput
          leftIcon={'filter'}
          placeholder={'Filter histogram...'}
          value={inputValue}
          onValueChange={setInputValue}
        />
      </PadWrapper>
      <PadWrapper>
        <BpInput
          placeholder={'Password'}
          type={'password'}
          value={inputValue}
          onValueChange={setInputValue}
        />
      </PadWrapper>
      <PadWrapper>
        <TextArea fill={true} value={'value'} />
      </PadWrapper>
      <PadWrapper>
        <Button icon={'refresh'} rightIcon={'duplicate'}>
          {'default'}
        </Button>
      </PadWrapper>
      <PadWrapper>
        <Button intent={'primary'}>{'primary'}</Button>
      </PadWrapper>
      <PadWrapper>
        <Button intent={'success'}>{'success'}</Button>
      </PadWrapper>
      <PadWrapper>
        <Button intent={'warning'}>{'warning'}</Button>
      </PadWrapper>
      <PadWrapper>
        <Button intent={'danger'}>{'danger'}</Button>
      </PadWrapper>
      <PadWrapper>
        <Button intent={'none'}>{'none'}</Button>
      </PadWrapper>
      <PadWrapper>
        <BpTimePicker
          // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
          time={{ hours: 12, minutes: 34 }}
          onTimeChange={clog}
        />
      </PadWrapper>
      <PadWrapper>
        <BpSelect options={options} onValueChange={noop} />
      </PadWrapper>
      <PadWrapper>
        <BpSwitch
          checked={bpSwitchState}
          // eslint-disable-next-line react-perf/jsx-no-jsx-as-prop
          labelElement={<strong>{'switch'}</strong>}
          onToggle={onBpSwitchChangeHandler}
        />
      </PadWrapper>
    </div>
  );
});

const PadWrapper = styled.div`
  padding: 5px;
`;

const IconWrapper = styled.div`
  display: inline-block;
  padding: 5px;
`;
