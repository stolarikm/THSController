import BackgroundService from 'react-native-background-actions';
import FirebaseService from './FirebaseService';

export default class PeriodicalPollingService {
  static timeoutTask = async (fn, period) => {
    return new Promise(async (resolve) => {
      await fn();
      setTimeout(function () {
        resolve('Done');
      }, period);
    });
  };

  static periodicTask = async (args) => {
    const { fn, period } = args;
    await new Promise(async (resolve) => {
      while (BackgroundService.isRunning()) {
        await this.timeoutTask(fn, period);
      }
      resolve('Done');
    });
  };

  static start = async (func, interval) => {
    try {
      await FirebaseService.setGatewayLock(true);
    } catch (error) {
      console.log(error);
    }

    var opts = {
      taskName: 'THS Controller',
      taskTitle: 'Gateway service running',
      taskDesc: 'Tap to open the controller',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      parameters: {
        fn: func,
        period: interval,
      },
    };
    await BackgroundService.start(this.periodicTask, opts);
  };

  static isRunning() {
    return BackgroundService.isRunning();
  }

  static async stop() {
    try {
      await FirebaseService.setGatewayLock(false);
    } catch (error) {
      console.log(error);
    }
    await BackgroundService.stop();
  }
}
