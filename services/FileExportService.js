import RNFS, { writeFile } from 'react-native-fs';
import XLSX from 'xlsx';
import { PermissionsAndroid, Platform } from 'react-native';
import Toast from 'react-native-simple-toast';

export default class FileExportService {

  static getFilename() {
    var date = new Date();
    var YYYY = `${date.getFullYear()}`.padStart(4, '0');
    var MM = `${date.getMonth() + 1}`.padStart(2, '0');
    var DD = `${date.getDate()}`.padStart(2, '0');
    var hh = `${date.getHours()}`.padStart(2, '0');
    var mm = `${date.getMinutes()}`.padStart(2, '0');
    var ss = `${date.getSeconds()}`.padStart(2, '0');
    var millis = `${date.getMilliseconds()}`.padStart(3, '0');
    return `${YYYY}${MM}${DD}_${hh}${mm}${ss}_${millis}`;
  }

  static preprocessData(devices) {
    return devices.map((device) => { 
      return { 
        deviceName: device.name, 
        data: device.readings.map((reading) => {
          return { 
            Time: reading.time,
            Temperature: reading.temperature,
            Humidity: reading.humidity }
        })
      }
    });
  }

  static async exportToExcel(devices) {
    var directory = RNFS.DocumentDirectoryPath  +'/THSControllerExport/'; //save to documents in iOS
    if (Platform.OS === 'android') {
      var granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return;
      }
      directory = RNFS.ExternalStorageDirectoryPath  +'/THSControllerExport/';  //save to external storage on android
    }
    
    var dataArray = FileExportService.preprocessData(devices);
    var wb = XLSX.utils.book_new();
    for (deviceData of dataArray) {
      var ws = XLSX.utils.json_to_sheet(deviceData.data);
      XLSX.utils.book_append_sheet(wb, ws, deviceData.deviceName);
    }

    const wbout = XLSX.write(wb, {type:'binary', bookType:"xlsx"});
    RNFS.mkdir(directory);
    const filename = directory + FileExportService.getFilename() + '.xlsx';
    writeFile(filename, wbout, 'ascii')
      .then(()=>{ 
        Toast.show('File saved to ' + filename, Toast.LONG);
      })
      .catch((e)=>{ 
        Toast.show('Can not save file: ' + e, Toast.LONG);
      });
  }
}