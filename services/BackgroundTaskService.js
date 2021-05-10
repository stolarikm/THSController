import BackgroundService from "react-native-background-actions";
import FirebaseService from "./FirebaseService";

/**
 * Service module for managing background tasks
 */
export default class BackgroundTaskService {
  /**
   * Creates a task, which resolves only after specified timeout
   * The task itself is performed instantly,
   * the timeout is being wait for afterwards
   * @param fn task to perform
   * @param period timeout to wait
   * @returns
   */
  static timeoutTask = async (fn, period) => {
    return new Promise(async (resolve) => {
      await fn();
      setTimeout(function () {
        resolve("Done");
      }, period);
    });
  };

  /**
   * Creates a task, which will be executed periodically
   * @param args { fn: task to be executed, period: timeout to wait in between }
   */
  static periodicTask = async (args) => {
    const { fn, period } = args;
    await new Promise(async (resolve) => {
      while (BackgroundService.isRunning()) {
        await this.timeoutTask(fn, period);
      }
      resolve("Done");
    });
  };

  /**
   * Starts the background service
   * @param func function to be periodically performed in background
   * @param interval timeout between executions
   */
  static start = async (func, interval) => {
    try {
      await FirebaseService.setGatewayLock(true);
    } catch (error) {
      console.log(error);
    }
    var opts = {
      taskName: "THS Controller",
      taskTitle: "Gateway service running",
      taskDesc: "Tap to open the controller",
      taskIcon: {
        name: "ic_launcher",
        type: "mipmap",
      },
      parameters: {
        fn: func,
        period: interval,
      },
    };
    await BackgroundService.start(this.periodicTask, opts);
  };

  /**
   * Returns true if the background service is running, false otherwise
   */
  static isRunning() {
    return BackgroundService.isRunning();
  }

  /**
   * Stops the background service
   */
  static async stop() {
    try {
      await FirebaseService.setGatewayLock(false);
    } catch (error) {
      console.log(error);
    }
    await BackgroundService.stop();
  }
}
