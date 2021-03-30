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

  static preprocessData(data) {
    return data[0].devices.map((device) => { 
      return { 
        deviceName: device.name, 
        data: FileExportService.getDeviceData(data, device.name)
      }
    });
  }

  static getDeviceData(data, deviceName) {
    var result = []
    for (timeEntry of data) {
      for (deviceEntry of timeEntry.devices.filter(e => e.name === deviceName)) {
        result.push({ Time: timeEntry.time, Temperature: deviceEntry.value });
      }
    }
    return result;
  }

  static async exportToExcel(data) {
    if (Platform.OS === 'android') {
      var granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (!granted) {
        return;
      }
    }
    
    var dataArray = FileExportService.preprocessData(data);
    var wb = XLSX.utils.book_new();
    for (deviceData of dataArray) {
      
      var ws = XLSX.utils.json_to_sheet(deviceData.data);
      XLSX.utils.book_append_sheet(wb, ws, deviceData.deviceName);
    }

    const wbout = XLSX.write(wb, {type:'binary', bookType:"xlsx"});
    RNFS.mkdir(RNFS.ExternalStorageDirectoryPath +'/THSControllerExport');
    const filename = RNFS.ExternalStorageDirectoryPath + '/THSControllerExport/' + FileExportService.getFilename() + '.xlsx';
    writeFile(filename, wbout, 'ascii')
      .then(()=>{ 
        Toast.show('File saved to ' + filename, Toast.LONG);
      })
      .catch((e)=>{ 
        Toast.show('Can not save file: ' + e, Toast.LONG);
      });
  }
}