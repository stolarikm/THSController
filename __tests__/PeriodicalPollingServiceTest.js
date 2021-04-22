import PeriodicalPollingService from '../services/PeriodicalPollingService';
import BackgroundService from 'react-native-background-actions';
import FirebaseService from '../services/FirebaseService';
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')

it('creates timeout task correctly', async () => {
    const fn = jest.fn();
    await expect(PeriodicalPollingService.timeoutTask(fn, 1000)).resolves.toEqual("Done");
    expect(fn).toHaveBeenCalledTimes(1);
});

it('creates periodic task correctly', async () => {
    jest.mock('react-native-background-actions');
    var runningState = true;
    BackgroundService.isRunning = () => runningState;
    const mockFn = jest.fn();
    const fn = () => {
        mockFn();
        runningState = false;
    }
    await expect(PeriodicalPollingService.periodicTask({ fn: fn, period: 1000 })).resolves.toEqual();
    expect(mockFn).toHaveBeenCalledTimes(1);
});

it('starts periodical polling correctly', async () => {
    jest.mock('react-native-background-actions');
    var runningState = true;
    BackgroundService.isRunning = () => runningState;
    BackgroundService.start = jest.fn();
    const mockFn = jest.fn();
    await expect(PeriodicalPollingService.start(mockFn, 1000)).resolves.toEqual();
    expect(BackgroundService.start).toHaveBeenCalledTimes(1);
});

it('returns running state correctly', () => {
    jest.mock('react-native-background-actions');
    BackgroundService.isRunning = () => true;
    expect(PeriodicalPollingService.isRunning()).toEqual(true);
});

it('returns not running state correctly', () => {
    jest.mock('react-native-background-actions');
    BackgroundService.isRunning = () => false;
    expect(PeriodicalPollingService.isRunning()).toEqual(false);
});

it('stops correctly', async () => {
    jest.mock('react-native-background-actions');
    jest.mock('../services/FirebaseService');
    FirebaseService.setGatewayLock = jest.fn();
    var runningState = true;
    BackgroundService.isRunning = () => runningState;
    BackgroundService.stop = () => runningState = false;
    expect(runningState).toEqual(true);
    await PeriodicalPollingService.stop();
    expect(runningState).toEqual(false);
});

/*
    static async stop() {
        try{
            await FirebaseService.setGatewayLock(false,);
        } catch (error) {
            console.log(error);
        }
        await BackgroundService.stop();
    }
    */