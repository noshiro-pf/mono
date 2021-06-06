import type { HTMLSelectProps } from '@blueprintjs/core';
import { Button, TextArea } from '@blueprintjs/core';
import {
  BpInput,
  BpSelect,
  BpSwitch,
  BpTimePicker,
} from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useToggleState } from '@noshiro/react-utils';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
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

const size: CSSProperties = { width: '32px', height: '32px' };

const options: Readonly<HTMLSelectProps['options']> = [
  { value: '', label: 'select...' },
  { value: 0, label: 'aaa' },
  { value: 1, label: 'bbb' },
];

export const UiPartsTest = memoNamed('UiPartsTest', () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [bpSwitchState, onBpSwitchChangeHandler] = useToggleState(false);

  return (
    <div>
      <div>
        <IconWrapper>
          <CircleIcon color='black' style={size} />
        </IconWrapper>
        <IconWrapper>
          <TriangleIcon color='red' style={size} />
        </IconWrapper>
        <IconWrapper>
          <CloseIcon color='blue' style={size} />
        </IconWrapper>
        <IconWrapper>
          <EditIcon color='lightblue' style={size} />
        </IconWrapper>
        <IconWrapper>
          <DeleteIcon color='gray' style={size} />
        </IconWrapper>
        <IconWrapper>
          <CommentIcon color='green' style={size} />
        </IconWrapper>
        <IconWrapper>
          <CalendarIcon color='purple' style={size} />
        </IconWrapper>
      </div>
      <PadWrapper>
        <BpInput
          leftIcon='filter'
          value={inputValue}
          onValueChange={setInputValue}
          placeholder='Filter histogram...'
        />
      </PadWrapper>
      <PadWrapper>
        <BpInput
          value={inputValue}
          onValueChange={setInputValue}
          placeholder='Password'
          type='password'
        />
      </PadWrapper>
      <PadWrapper>
        <TextArea fill={true} value={'value'} />
      </PadWrapper>
      <PadWrapper>
        <Button icon='refresh' rightIcon='duplicate'>
          default
        </Button>
      </PadWrapper>
      <PadWrapper>
        <Button intent='primary'>primary</Button>
      </PadWrapper>
      <PadWrapper>
        <Button intent='success'>success</Button>
      </PadWrapper>
      <PadWrapper>
        <Button intent='warning'>warning</Button>
      </PadWrapper>
      <PadWrapper>
        <Button intent='danger'>danger</Button>
      </PadWrapper>
      <PadWrapper>
        <Button intent='none'>none</Button>
      </PadWrapper>
      <PadWrapper>
        <BpTimePicker time={{ hours: 12, minutes: 34 }} onTimeChange={clog} />
      </PadWrapper>
      <PadWrapper>
        <BpSelect options={options} onValueChange={noop} />
      </PadWrapper>
      <PadWrapper>
        <BpSwitch
          checked={bpSwitchState}
          onToggle={onBpSwitchChangeHandler}
          labelElement={<strong>switch</strong>}
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

const noop = (): void => undefined;
