jest.useFakeTimers();
import React from 'react';
import renderer from 'react-test-renderer';
import GatewayScreen from '../../screens/GatewayScreen';

/**
 * Snapshot test of the gateway screen
 */
it('renders correctly', () => {
  const tree = renderer.create(<GatewayScreen />).toJSON();
  expect(tree).toMatchSnapshot();
});
