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
import { clog } from '../../utils/log';
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

export const UiPartsTest = memoNamed<Record<string, void>>(
  'UiPartsTest',
  () => {
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
  }
);

const PadWrapper = styled.div`
  padding: 5px;
`;

const IconWrapper = styled.div`
  display: inline-block;
  padding: 5px;
`;

const noop = (): void => undefined;
