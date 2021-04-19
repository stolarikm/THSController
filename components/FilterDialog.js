import React, { useState } from 'react';
import { Button, Dialog, Portal, RadioButton } from 'react-native-paper';

const FilterDialog = ({ visible, close, currentFilter, confirm }) => {

  const [filter, setFilter] = useState(currentFilter);

  const ok = () => {
    confirm(filter);
    close();
  }

  return (
    <Portal>
    <Dialog
      visible={visible}
      onDismiss={close}>
      <Dialog.Title>Filter data</Dialog.Title>
      <Dialog.Content>
        <RadioButton.Group onValueChange={value => setFilter(value)} value={filter}>
          <RadioButton.Item label="None" value="none" />
          <RadioButton.Item label="Last minute" value="minute" />
          <RadioButton.Item label="Last hour" value="hour" />
          <RadioButton.Item label="Last day" value="day" />
          <RadioButton.Item label="Last week" value="week" />
          <RadioButton.Item label="Last month" value="month" />
        </RadioButton.Group>
      </Dialog.Content>
      <Dialog.Actions style={{justifyContent: 'space-between'}}>
        <Button onPress={close}>Cancel</Button>
        <Button onPress={ok}>OK</Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
  );
};

export default FilterDialog;