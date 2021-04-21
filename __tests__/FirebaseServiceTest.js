import FirebaseService from "../services/FirebaseService";
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')

it('creates default model correctly', () => {
    const result = FirebaseService.defaultModel()
    const expected = { 
        devices: [],
        commands: [],
        gatewayLock: undefined
     };
    expect(result).toEqual(expected);
});

it('gets document correctly', async () => {
    const result = (await FirebaseService.getDocument()).data();
    expect(JSON.stringify(result)).toEqual(JSON.stringify({
        commands: [],
        gatewayLock: null,
        devices: [{
            ip: "192.168.100.68",
            name: "Tester",
            readings: [{
                time: { toDate: () => { return new Date(2021, 0, 1, 15); }},
                temperature: 25.8,
                humidity: 45.5
            },]
        },
        {
            ip: "192.168.100.69",
            name: "Fester",
            readings: [{
                time: { toDate: () => { return new Date(2021, 0, 1, 16); }},
                temperature: 25.4,
                humidity: 46.9
            },]
        }]
    }));
});

it('sets document without exception', async () => {
    const doc = {
        commands: [],
        gatewayLock: null,
        devices: [{
            ip: "192.168.100.68",
            name: "Tester",
            readings: [{
                time: { toDate: () => { return new Date(2021, 0, 1, 15); }},
                temperature: 25.8,
                humidity: 45.5
            },]
        },
        {
            ip: "192.168.100.69",
            name: "Fester",
            readings: [{
                time: { toDate: () => { return new Date(2021, 0, 1, 16); }},
                temperature: 25.4,
                humidity: 46.9
            },]
        }]
    };
    expect(FirebaseService.setDocument(doc)).resolves.not.toThrow();
});

it('merges new data readings correctly', () => {
    const doc = {
        commands: [],
        gatewayLock: null,
        devices: [{
            ip: "192.168.100.68",
            name: "Tester",
            readings: [{
                time: { toDate: () => { return new Date(2021, 0, 1, 15); }},
                temperature: 25.8,
                humidity: 45.5
            },]
        },
        {
            ip: "192.168.100.69",
            name: "Fester",
            readings: [{
                time: { toDate: () => { return new Date(2021, 0, 1, 16); }},
                temperature: 25.4,
                humidity: 46.9
            },]
        }]
    };
    const updateData = [{
        ip: "192.168.100.68",
        name: "Tester",
        readings: [{
            time: { toDate: () => { return new Date(2021, 0, 2, 15); }},
            temperature: 30,
            humidity: 50
        },]
    },
    {
        ip: "192.168.100.69",
        name: "Fester",
        readings: [{
            time: { toDate: () => { return new Date(2021, 0, 2, 16); }},
            temperature: 30,
            humidity: 50
        },]
    }];
    const result = FirebaseService.mergeReadings(doc, updateData);
    expect(JSON.stringify(result)).toEqual(JSON.stringify({
        commands: [],
        gatewayLock: null,
        devices: [{
            ip: "192.168.100.68",
            name: "Tester",
            readings: [{
                time: { toDate: () => { return new Date(2021, 0, 1, 15); }},
                temperature: 25.8,
                humidity: 45.5
            }, {
                time: { toDate: () => { return new Date(2021, 0, 2, 15); }},
                temperature: 30,
                humidity: 50
            }]
        },
        {
            ip: "192.168.100.69",
            name: "Fester",
            readings: [{
                time: { toDate: () => { return new Date(2021, 0, 1, 16); }},
                temperature: 25.4,
                humidity: 46.9
            }, {
                time: { toDate: () => { return new Date(2021, 0, 2, 16); }},
                temperature: 30,
                humidity: 50
            }]
        }]
    }));
});

it('locks gateway lock correctly', () => {
    const data = { commands: [], devices: [], gatewayLock: null };
    const gatewayLockData = FirebaseService.gatewayLock(data, true);
    expect(gatewayLockData).toEqual({ commands: [], devices: [], gatewayLock: "7ab2f" });
});

it('unlocks gateway lock correctly', () => {
    const data = { commands: [], devices: [], gatewayLock: "7ab2f" };
    const gatewayLockData = FirebaseService.gatewayLock(data, false);
    expect(gatewayLockData).toEqual({ commands: [], devices: [], gatewayLock: undefined });
});

it('rejects locking locked data', () => {
    const data = { commands: [], devices: [], gatewayLock: "locked7x2s9" };
    expect(() => FirebaseService.gatewayLock(data, true)).toThrow(Error("Can not acquire gateway lock"));
});

it('sets gateway lock to unlocked data without exception', async () => {
    const doc = {
        commands: [],
        gatewayLock: null,
        devices: [{
            ip: "192.168.100.68",
            name: "Tester",
            readings: [{
                time: { toDate: () => { return new Date(2021, 0, 1, 15); }},
                temperature: 25.8,
                humidity: 45.5
            },]
        },
        {
            ip: "192.168.100.69",
            name: "Fester",
            readings: [{
                time: { toDate: () => { return new Date(2021, 0, 1, 16); }},
                temperature: 25.4,
                humidity: 46.9
            },]
        }]
    };
    await expect(FirebaseService.setGatewayLock(true)).resolves.toEqual();
});

it('returns gateway lock available correctly', async () => {
    await expect(FirebaseService.isGatewayLockAvailable()).resolves.toEqual(true);
});

it('returns data present correctly', async () => {
    await expect(FirebaseService.areDataPresent()).resolves.toEqual(true);
});

it('clears data without exception', async () => {
    await expect(FirebaseService.clearData()).resolves.toEqual();
});

it('enqueues command correctly', () => {
    const data = { commands: [{ command: "temp_corr", value: 5, ips: ["192.168.100.1"]}], devices: [], gatewayLock: null };
    const command = { command: "humidity_corr", value: 5, ips: ["192.168.100.1"]};
    expect(FirebaseService.enqueue(data, command)).toEqual({
        commands: [{ command: "temp_corr", value: 5, ips: ["192.168.100.1"]}, { command: "humidity_corr", value: 5, ips: ["192.168.100.1"]}],
        devices: [],
        gatewayLock: null
    });
});

it('dequeues command correctly', () => {
    const data = {
        commands: [{ command: "temp_corr", value: 5, ips: ["192.168.100.1"]}, { command: "humidity_corr", value: 5, ips: ["192.168.100.1"]}],
        devices: [],
        gatewayLock: null
    };
    expect(FirebaseService.dequeue(data)).toEqual({
        command: { command: "temp_corr", value: 5, ips: ["192.168.100.1"]},
        data: {
            commands: [{ command: "humidity_corr", value: 5, ips: ["192.168.100.1"]}],
            devices: [],
            gatewayLock: null
        }
    });
});

it('uploads readings without exception', async () => {
    const updateDevices = [{
        ip: "192.168.100.68",
        name: "Tester",
        readings: [{
            time: { toDate: () => { return new Date(2021, 0, 1, 15); }},
            temperature: 25.8,
            humidity: 45.5
        },]
    },
    {
        ip: "192.168.100.69",
        name: "Fester",
        readings: [{
            time: { toDate: () => { return new Date(2021, 0, 1, 16); }},
            temperature: 25.4,
            humidity: 46.9
        },]
    }]
    await expect(FirebaseService.uploadReadings(updateDevices)).resolves.toEqual();
});

it('queues command without exception', async () => {
    const command = { command: "humidity_corr", value: 5, ips: ["192.168.100.1"]};
    await expect(FirebaseService.queueCommand(command)).resolves.toEqual();
});

it('pops null command on empty command data', async () => {
    await expect(FirebaseService.popCommand()).resolves.toEqual(null);
});