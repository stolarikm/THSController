jest.useFakeTimers();
import React from 'react';
import renderer from 'react-test-renderer';
import MonitorScreen from '../../screens/MonitorScreen';

it('renders correctly', () => {
  const tree = renderer.create(<MonitorScreen />).toJSON();
  expect(tree).toMatchSnapshot();
});
