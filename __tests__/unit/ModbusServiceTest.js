import ModbusService from '../../services/ModbusService';

it('connects to existing device correctly', async () => {
  await expect(ModbusService.connect('192.168.100.68', '502')).resolves.toEqual(
    'success'
  );
});

it('throws when attempting to connect to non existing device', async () => {
  await expect(ModbusService.connect('192.168.100.1', '502')).rejects.toEqual(
    'Connected already'
  );
});

it('disconnects a connected device correctly', async () => {
  ModbusService.connected = true;
  await expect(ModbusService.disconnect()).resolves.toEqual();
});

it('attempt to disconnect with no connection does nothing', async () => {
  ModbusService.connected = false;
  await expect(ModbusService.disconnect()).resolves.toEqual();
});

it('reads register correctly', async () => {
  ModbusService.connected = true;
  await expect(ModbusService.read(0)).resolves.toEqual('[258]');
});

it('writes register without exception', async () => {
  ModbusService.connected = true;
  await expect(ModbusService.write(2000, 5)).resolves.toEqual('success');
});

it('validates correct device data to true', () => {
  const result = ModbusService.validateRead('[258]');
  expect(result).toEqual(true);
});

it('validates incorrect device data to false', () => {
  const result = ModbusService.validateRead('[error]');
  expect(result).toEqual(false);
});

it('parses device data correctly', () => {
  const result = ModbusService.parseRead('[258]');
  expect(result).toEqual(25.8);
});

it('reads device data correctly', async () => {
  ModbusService.connected = false;
  await expect(
    ModbusService.readTemperatureAndHumidity('192.168.100.68', '502')
  ).resolves.toEqual({
    temperature: 25.8,
    humidity: 52.3,
  });
});

it('sends command without exception', async () => {
  ModbusService.connected = false;
  const command = {
    command: 'humidity_corr',
    value: 5,
    register: 2000,
    ips: ['192.168.100.68'],
  };
  await expect(
    ModbusService.sendCommand('192.168.100.68', '502', command)
  ).resolves.toEqual();
});

it('preprocesses tempeature correction command correctly', () => {
  const command = {
    command: 'temp_corr',
    value: '5.8',
    register: 2000,
    ips: ['192.168.100.68'],
  };
  const result = ModbusService.preprocessCommand(command);
  expect(result).toEqual({
    command: 'temp_corr',
    value: 58,
    register: 2000,
    ips: ['192.168.100.68'],
  });
});

it('preprocesses tempeature units command correctly', () => {
  const command = {
    command: 'temp_units',
    value: 'F',
    register: 2000,
    ips: ['192.168.100.68'],
  };
  const result = ModbusService.preprocessCommand(command);
  expect(result).toEqual({
    command: 'temp_units',
    value: 70,
    register: 2000,
    ips: ['192.168.100.68'],
  });
});

it('returns presence of existing device correctly', async () => {
  await expect(
    ModbusService.isDevicePresent('192.168.100.68', '502')
  ).resolves.toEqual(true);
});

it('returns presence of nonexisting device correctly', async () => {
  await expect(
    ModbusService.isDevicePresent('192.168.100.1', '502')
  ).resolves.toEqual(false);
});
