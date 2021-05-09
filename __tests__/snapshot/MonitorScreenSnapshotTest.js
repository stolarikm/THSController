jest.useFakeTimers();
import React from 'react';
import renderer from 'react-test-renderer';
import MonitorScreen from '../../screens/MonitorScreen';

/**
 * Snapshot test of the monitor screen
 */
it('renders correctly', () => {
  const tree = renderer.create(<MonitorScreen />).toJSON();
  expect(tree).toMatchSnapshot();
});
