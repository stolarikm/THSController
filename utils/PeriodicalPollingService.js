import BackgroundService from 'react-native-background-actions';

export default class PeriodicalPollingService {

    static timeoutTask = (fn, period) => {
        return new Promise(function (resolve, reject) {
            fn();
            setTimeout(function () {
              resolve("Done");
            }, period);
          });
    }

    static periodicTask = async (args) => {
        const { fn, period } = args;
        await new Promise( async (resolve) => {
            while(BackgroundService.isRunning()) {
                await this.timeoutTask(fn, period);
            }
        });
    };

    static start = async (func, interval) => {
        var opts = {
            taskName: 'THS Controller',
            taskTitle: 'Monitoring sensors',
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

    static async stop() {
        await BackgroundService.stop();
    }
}