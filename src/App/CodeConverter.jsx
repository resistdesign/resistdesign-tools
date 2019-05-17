import T from 'prop-types';
import React, {PureComponent} from 'react';
import styled from 'styled-components';
import {convertLines} from './CodeConverter/Utils';

const Base = styled.div`
  
`;

const TextEditor = styled.textarea`
  font-family: monospace;
`;

export default class CodeConverter extends PureComponent {
  static propTypes = {};

  state = {
    inputData: '',
    inputTemplate: '',
    outputTemplate: '',
    outputData: ''
  };

  onConvertData = () => {
    const {
      inputData = '',
      inputTemplate = '',
      outputTemplate = ''
    } = this.state;
    const lines = inputData.split('\n');

    this.setState({
      outputData: convertLines(lines, inputTemplate, outputTemplate).join('\n')
    });
  };

  render() {
    return (
      <Base>

      </Base>
    );
  }
}
