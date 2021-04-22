import FileExportService from '../../services/FileExportService';

it('parses time label correctly', () => {
    const filename = FileExportService.parseLabel(new Date(2021, 0, 1, 14, 35, 22));
    expect(filename).toEqual("1.1. 14:35:22");
});

it('preprocess data without filters correctly', () => {
    const devices = [
        {
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
        }];
    const dateFrom = new Date(1999, 0, 1);
    const selectedDevices = ["192.168.100.68", "192.168.100.69"];
    const processedData = FileExportService.preprocessData(devices, dateFrom, selectedDevices);
    expect(processedData).toEqual([
        {
            deviceName: "Tester",
            data: [{
                Time: "1.1. 15:00:00",
                Temperature: 25.8,
                Humidity: 45.5
            },]
        },
        {
            deviceName: "Fester",
            data: [{
                Time: "1.1. 16:00:00",
                Temperature: 25.4,
                Humidity: 46.9
            },]
        }]);
});

it('preprocess data with selected devices filter correctly', () => {
    const devices = [
        {
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
        }];
    const dateFrom = new Date(1999, 0, 1);
    const selectedDevices = ["192.168.100.68"];
    const processedData = FileExportService.preprocessData(devices, dateFrom, selectedDevices);
    expect(processedData).toEqual([
        {
            deviceName: "Tester",
            data: [{
                Time: "1.1. 15:00:00",
                Temperature: 25.8,
                Humidity: 45.5
            },]
        }]);
});

it('preprocess data with datetime filter correctly', () => {
    const devices = [
        {
            ip: "192.168.100.68",
            name: "Tester",
            readings: [{
                time: { toDate: () => { return new Date(1999, 0, 1, 15); }},
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
        }];
    const dateFrom = new Date(2002, 0, 1);
    const selectedDevices = ["192.168.100.68", "192.168.100.69"];
    const processedData = FileExportService.preprocessData(devices, dateFrom, selectedDevices);
    expect(processedData).toEqual([
        {
            deviceName: "Tester",
            data: []
        },
        {
            deviceName: "Fester",
            data: [{
                Time: "1.1. 16:00:00",
                Temperature: 25.4,
                Humidity: 46.9
            },]
        }]);
});

it('returns corrent filename', () => {
    const mockDate = new Date(2021, 0, 1, 14, 0, 0, 0);
    const spy = jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockDate)
    const filename = FileExportService.getFilename();
    expect(filename).toEqual("20210101_140000_000");
});

it('exports file without exception', async () => {
    const devices = [
        {
            ip: "192.168.100.68",
            name: "Tester",
            readings: [{
                time: { toDate: () => { return new Date(1999, 0, 1, 15); }},
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
        }];
    const directory = "TestDir/";
    const dateFrom = new Date(2002, 0, 1);
    const selectedDevices = ["192.168.100.68", "192.168.100.69"];
    await expect(FileExportService.exportToExcel(devices, directory, dateFrom, selectedDevices)).resolves.toEqual();
});