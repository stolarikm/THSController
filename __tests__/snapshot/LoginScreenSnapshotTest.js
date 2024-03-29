jest.useFakeTimers();
import React from 'react';
import renderer from 'react-test-renderer';
import LoginScreen from '../../screens/LoginScreen';

/**
 * Snapshot test of the login screen
 */
it('renders correctly', () => {
  const tree = renderer.create(<LoginScreen />).toJSON();
  expect(tree).toMatchSnapshot();
});
