import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default class FirebaseService {

    static getDocument = async () => {
        var user = auth().currentUser;
        return await firestore()
            .collection("readings")
            .doc(user.email)
            .get();
    }
    
    static setDocument = (doc) => {
        var user = auth().currentUser;
        firestore()
            .collection("readings")
            .doc(user.email)
            .set(doc);
    }

    static mergeReadings = (data, newData) => {
        if (!data || !data.devices) {
            //init
            data = { devices: [] };
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
    }

    static uploadReadings = async (updateDevices) => {
        FirebaseService.setDocument(FirebaseService.mergeReadings((await FirebaseService.getDocument()).data(), updateDevices));
    }
}