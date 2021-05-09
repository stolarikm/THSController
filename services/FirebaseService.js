import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DeviceInfo from 'react-native-device-info';

export default class FirebaseService {
  static defaultModel = () => {
    return {
      devices: [],
      commands: [],
      gatewayLock: undefined,
    };
  };

  static getDocument = async () => {
    var user = auth().currentUser;
    return await firestore().collection('readings').doc(user.email).get();
  };

  static setDocument = async (doc) => {
    var user = auth().currentUser;
    await firestore().collection('readings').doc(user.email).set(doc);
  };

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

  static gatewayLock = (data, lock) => {
    if (!data) {
      //init
      data = this.defaultModel();
    }
    if (lock) {
      if (data.gatewayLock) {
        throw new Error('Can not acquire gateway lock');
      }
      data.gatewayLock = DeviceInfo.getUniqueId();
    } else {
      if (data.gatewayLock !== DeviceInfo.getUniqueId()) {
        throw new Error('Can not unlock gateway lock');
      }
      data.gatewayLock = undefined;
    }
    return data;
  };

  static setGatewayLock = async (lock) => {
    var data = (await FirebaseService.getDocument()).data();
    var newData = FirebaseService.gatewayLock(
      data,
      lock,
      DeviceInfo.getUniqueId()
    );
    await FirebaseService.setDocument(newData);
  };

  static isGatewayLockAvailable = async () => {
    var data = (await FirebaseService.getDocument()).data();
    return (
      !data ||
      !data.gatewayLock ||
      data.gatewayLock === DeviceInfo.getUniqueId()
    );
  };

  static areDataPresent = async () => {
    var data = (await FirebaseService.getDocument()).data();
    return data && data.devices && data.devices.length > 0;
  };

  static clearData = async () => {
    var data = (await FirebaseService.getDocument()).data();
    data.devices = [];
    await FirebaseService.setDocument(data);
  };

  static enqueue = (data, newData) => {
    if (!data.commands) {
      data.commands = [newData];
    } else {
      data.commands.push(newData);
    }
    return data;
  };

  static dequeue = (data) => {
    if (!data || !data.commands || data.commands.length === 0) {
      return { command: null, data: null };
    }
    var command = data.commands.shift();

    return { command, data };
  };

  static uploadReadings = async (updateDevices) => {
    FirebaseService.setDocument(
      FirebaseService.mergeReadings(
        (await FirebaseService.getDocument()).data(),
        updateDevices
      )
    );
  };

  static queueCommand = async (command) => {
    await FirebaseService.setDocument(
      FirebaseService.enqueue(
        (await FirebaseService.getDocument()).data(),
        command
      )
    );
  };

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
