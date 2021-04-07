import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default class FirebaseService {

    static defaultModel = () => {
        return { 
            devices: [],
            commands: []
         };
    }

    static getDocument = async () => {
        var user = auth().currentUser;
        return await firestore()
            .collection("readings")
            .doc(user.email)
            .get();
    }
    
    static setDocument = async (doc) => {
        var user = auth().currentUser;
        await firestore()
            .collection("readings")
            .doc(user.email)
            .set(doc);
    }

    static mergeReadings = (data, newData) => {
        if (!data || !data.devices) {
            //init
            data = defaultModel();
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

    static enqueue = (data, newData) => {
        if (!data.commands) {
            data.commands = [newData];
        } else {
            data.commands.push(newData);
        }
        return data;
    }

    static dequeue = (data) => {
        if (!data || !data.commands || data.commands.length === 0) {
            return { command: null, data: null };
        }
        var command = data.commands.shift();
        
        return { command, data };
    }

    static uploadReadings = async (updateDevices) => {
        FirebaseService.setDocument(FirebaseService.mergeReadings((await FirebaseService.getDocument()).data(), updateDevices));
    }

    static queueCommand = async (command) => {
        await FirebaseService.setDocument(FirebaseService.enqueue((await FirebaseService.getDocument()).data(), command));
    }

    static popCommand = async () => {
        var { command, data } = FirebaseService.dequeue((await FirebaseService.getDocument()).data());
        if (data != null) {
            await FirebaseService.setDocument(data);
        }
        return command;
    }
}