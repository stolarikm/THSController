import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import DeviceInfo from "react-native-device-info";

/**
 * Service module for accessing cloud system features
 * This module uses Firebase cloud products
 */
export default class FirebaseService {
  /**
   * Presents the model of the data stored in Firestore
   */
  static defaultModel = () => {
    return {
      devices: [],
      commands: [],
      gatewayLock: undefined,
    };
  };

  /**
   * Returns document of the currently logged-in user from Firestore
   */
  static getDocument = async () => {
    var user = auth().currentUser;
    return await firestore().collection("readings").doc(user.email).get();
  };

  /**
   * Saves the document of the currently logger-in user to Firestore
   * @param doc document
   */
  static setDocument = async (doc) => {
    var user = auth().currentUser;
    await firestore().collection("readings").doc(user.email).set(doc);
  };

  /**
   * Merges previous and updated data readings from a device
   * @param data previous data readings
   * @param newData updated data readings
   */
  static mergeReadings = (data, newData) => {
    if (!data || !data.devices) {
      //init
      data = this.defaultModel();
    }

    for (updateDevice of newData) {
      var device = data.devices.find((a) => a.ip === updateDevice.ip);
      if (device) {
        device.readings = device.readings.concat(updateDevice.readings);
      } else {
        data.devices.push(updateDevice);
      }
    }
    return data;
  };

  /**
   * Updates the gateway lock state in Firebase
   * @param data current document data
   * @param lock lock state
   */
  static gatewayLock = (data, lock) => {
    if (!data) {
      //init
      data = this.defaultModel();
    }
    if (lock) {
      if (data.gatewayLock) {
        throw new Error("Can not acquire gateway lock");
      }
      data.gatewayLock = DeviceInfo.getUniqueId();
    } else {
      if (data.gatewayLock !== DeviceInfo.getUniqueId()) {
        throw new Error("Can not unlock gateway lock");
      }
      data.gatewayLock = undefined;
    }
    return data;
  };

  /**
   * Sets the gateway lock state
   * @param lock true if locking the gateway lock, false if unlocking
   */
  static setGatewayLock = async (lock) => {
    var data = (await FirebaseService.getDocument()).data();
    var newData = FirebaseService.gatewayLock(
      data,
      lock,
      DeviceInfo.getUniqueId()
    );
    await FirebaseService.setDocument(newData);
  };

  /**
   * Checks if the gateway lock is available
   * Returns true if the lock is free,
   * or it is being held by the device calling this function, false otherwise
   */
  static isGatewayLockAvailable = async () => {
    var data = (await FirebaseService.getDocument()).data();
    return (
      !data ||
      !data.gatewayLock ||
      data.gatewayLock === DeviceInfo.getUniqueId()
    );
  };

  /**
   * Returns true if there are some device data in Firebase
   */
  static areDataPresent = async () => {
    var data = (await FirebaseService.getDocument()).data();
    return data && data.devices && data.devices.length > 0;
  };

  /**
   * Clears the devices data from Firebase
   */
  static clearData = async () => {
    var data = (await FirebaseService.getDocument()).data();
    data.devices = [];
    await FirebaseService.setDocument(data);
  };

  /**
   * Enqueues a command to command queue
   * @param data current document data
   * @param newData new command
   */
  static enqueue = (data, newData) => {
    if (!data.commands) {
      data.commands = [newData];
    } else {
      data.commands.push(newData);
    }
    return data;
  };

  /**
   * Dequeues the longest waiting command from the command queue
   * @param data current document data
   */
  static dequeue = (data) => {
    if (!data || !data.commands || data.commands.length === 0) {
      return { command: null, data: null };
    }
    var command = data.commands.shift();
    return { command, data };
  };

  /**
   * Uploads new data readings
   * @param updateDevices devices data to upload
   */
  static uploadReadings = async (updateDevices) => {
    FirebaseService.setDocument(
      FirebaseService.mergeReadings(
        (await FirebaseService.getDocument()).data(),
        updateDevices
      )
    );
  };

  /**
   * Puts a command to the end of a command queue
   * @param command command to enqueue
   */
  static queueCommand = async (command) => {
    await FirebaseService.setDocument(
      FirebaseService.enqueue(
        (await FirebaseService.getDocument()).data(),
        command
      )
    );
  };

  /**
   * Removes and returns a command from the start of the command queue
   * @returns longest waiting command, or null if queue is empty
   */
  static popCommand = async () => {
    var { command, data } = FirebaseService.dequeue(
      (await FirebaseService.getDocument()).data()
    );
    if (data != null) {
      await FirebaseService.setDocument(data);
    }
    return command;
  };
}
