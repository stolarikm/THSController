jest.useFakeTimers();
import React from 'react';
import renderer from 'react-test-renderer';
import CommandsScreen from '../../screens/CommandsScreen';

/**
 * Snapshot test of the command screen
 */
it('renders correctly', () => {
  const tree = renderer.create(<CommandsScreen />).toJSON();
  expect(tree).toMatchSnapshot();
});
