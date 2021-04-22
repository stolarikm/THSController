jest.useFakeTimers()
import React from 'react';
import renderer from 'react-test-renderer';
import GatewayScreen from '../../screens/GatewayScreen';

it('renders correctly', () => {
  const tree = renderer
    .create(<GatewayScreen />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});