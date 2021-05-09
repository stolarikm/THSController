import { ScrollView, View } from 'react-native';
import { Menu, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import React, { forwardRef, useEffect, useState } from 'react';

/*
 * This file is imported from library react-native-paper-dropdown
 * https://github.com/fateh999/react-native-paper-dropdown
 *
 * We use this copy of the file, due to unresolved issue with no reponse
 * https://github.com/fateh999/react-native-paper-dropdown/issues/4
 *
 * This file is slightly modified, firstly it includes the fix for the issue mentioned above.
 * Secondly, there is a Select component, to provide wrapper for DropDown, without need of tracking visibility state.
 */
const DropDown = forwardRef((props, ref) => {
  const activeTheme = useTheme();
  const {
    visible,
    onDismiss,
    showDropDown,
    value,
    setValue,
    activeColor,
    mode,
    label,
    placeholder,
    inputProps,
    list,
    dropDownContainerMaxHeight,
    theme,
  } = props;
  const [displayValue, setDisplayValue] = useState('');
  const [inputLayout, setInputLayout] = useState({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });

  const onLayout = (event) => {
    setInputLayout(event.nativeEvent.layout);
  };

  useEffect(() => {
    const _label = list.find((_) => _.value === value)?.label;
    if (_label) {
      setDisplayValue(_label);
    }
  }, [list, value]);

  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      theme={theme}
      anchor={
        <TouchableRipple ref={ref} onPress={showDropDown} onLayout={onLayout}>
          <View pointerEvents={'none'}>
            <TextInput
              value={displayValue}
              mode={mode}
              label={label}
              placeholder={placeholder}
              pointerEvents={'none'}
              theme={theme}
              {...inputProps}
            />
          </View>
        </TouchableRipple>
      }
      style={{
        maxWidth: inputLayout?.width,
        width: inputLayout?.width,
        marginTop: inputLayout?.height,
      }}
    >
      <ScrollView style={{ maxHeight: dropDownContainerMaxHeight || 200 }}>
        {list.map((_item, _index) => (
          <Menu.Item
            key={_index}
            theme={theme}
            titleStyle={{
              color:
                value === _item.value
                  ? activeColor || (theme || activeTheme).colors.primary
                  : (theme || activeTheme).colors.text,
            }}
            onPress={() => {
              setValue(_item.value);
              if (onDismiss) {
                onDismiss();
              }
            }}
            title={_item.custom || _item.label}
            style={{ width: inputLayout?.width }}
          />
        ))}
      </ScrollView>
    </Menu>
  );
});

/**
 * Select component to wrap the DropDown with visible state managed
 * @param  label label of the dropdown input
 * @param  value currently selected value
 * @param  setValue callback called when value is selected
 * @param  data drop down options
 */
const Select = ({ label, value, setValue, data }) => {
  const [showDropDown, setShowDropDown] = useState(false);

  return (
    <DropDown
      label={label}
      value={value}
      setValue={setValue}
      list={data}
      visible={showDropDown}
      showDropDown={() => setShowDropDown(true)}
      onDismiss={() => setShowDropDown(false)}
      inputProps={{
        right: <TextInput.Icon name={'menu-down'} />,
      }}
    />
  );
};

export { DropDown, Select };
