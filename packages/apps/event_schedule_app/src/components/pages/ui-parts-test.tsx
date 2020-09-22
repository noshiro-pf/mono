import { Button, TextArea } from '@blueprintjs/core';
import { memoNamed, useToggleState } from '@mono/react-utils';
import React, { CSSProperties, useState } from 'react';
import styled from 'styled-components';
import { IHoursMinutes } from '../../types/record/hours-minutes';
import { BpInput } from '../atoms/blueprint-js-wrapper/bp-input';
import { BpSelect } from '../atoms/blueprint-js-wrapper/bp-select';
import { BpSwitch } from '../atoms/blueprint-js-wrapper/bp-switch';
import { BpTimePicker } from '../atoms/blueprint-js-wrapper/bp-time-picker';
import {
  CalendarIcon,
  CircleIcon,
  CloseIcon,
  CommentIcon,
  DeleteIcon,
  EditIcon,
  TriangleIcon,
} from '../atoms/icons';

const size: CSSProperties = { width: '32px', height: '32px' };

const PadWrapper = styled.div`
  padding: 5px;
`;

const IconWrapper = styled.div`
  display: inline-block;
  padding: 5px;
`;

const noop = (): void => undefined;

export const UiPartsTest = memoNamed<{}>('UiPartsTest', () => {
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
        <BpTimePicker
          time={IHoursMinutes({ hours: 12, minutes: 34 })}
          onTimeChange={(e) => console.log(e)}
        />
      </PadWrapper>
      <PadWrapper>
        <BpSelect onValueChange={noop}>
          <option>select...</option>
          <option value={0}>aaa</option>
          <option value={1}>bbb</option>
        </BpSelect>
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
