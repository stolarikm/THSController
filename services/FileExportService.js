import RNFS, { writeFile } from "react-native-fs";
import XLSX from "xlsx";
import { PermissionsAndroid, Platform } from "react-native";
import Toast from "react-native-simple-toast";

/**
 * Service module for exporting data
 * This module exports data to XLSX format
 */
export default class FileExportService {
  /**
   * Returns filename of exported file
   * Filenames are composed of timestamp in format YYYYMMDD_hhmmssSSS;
   */
  static getFilename() {
    var date = new Date();
    var YYYY = `${date.getFullYear()}`.padStart(4, "0");
    var MM = `${date.getMonth() + 1}`.padStart(2, "0");
    var DD = `${date.getDate()}`.padStart(2, "0");
    var hh = `${date.getHours()}`.padStart(2, "0");
    var mm = `${date.getMinutes()}`.padStart(2, "0");
    var ss = `${date.getSeconds()}`.padStart(2, "0");
    var millis = `${date.getMilliseconds()}`.padStart(3, "0");
    return `${YYYY}${MM}${DD}_${hh}${mm}${ss}_${millis}`;
  }

  /**
   * Preprocesses the data into a format compatible with XLSX
   * @param devices data of devices
   * @param dateFrom lower boundary to filter data from some date
   * @param selectedDevices array of selected devices, to filter out others
   */
  static preprocessData(devices, dateFrom, selectedDevices) {
    return devices
      .filter((device) => selectedDevices.includes(device.ip))
      .map((device) => {
        return {
          deviceName: device.name,
          data: device.readings
            .filter((reading) => reading.time.toDate() >= dateFrom)
            .map((reading) => {
              return {
                Time: this.parseLabel(reading.time.toDate()),
                Temperature: reading.temperature,
                Humidity: reading.humidity,
              };
            }),
        };
      });
  }

  /**
   * Parses timestamp labels to strings
   * @param date timestamp
   */
  static parseLabel = (date) => {
    return (
      date.getDate() +
      "." +
      (date.getMonth() + 1) +
      ". " +
      date.toTimeString().split(" ")[0]
    );
  };

  /**
   * Exports the data to XLSX file
   * @param devices data of devices
   * @param directory firectory to save the file in
   * @param dateFrom lower boundary to filter data from some date
   * @param selectedDevices array of selected devices, to filter out others
   */
  static async exportToExcel(devices, directory, dateFrom, selectedDevices) {
    if (Platform.OS === "android") {
      var granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return;
      }
    }
    if (directory.slice(-1) !== "/") {
      directory += "/";
    }

    var dataArray = FileExportService.preprocessData(
      devices,
      dateFrom,
      selectedDevices
    );
    var wb = XLSX.utils.book_new();
    for (deviceData of dataArray) {
      var ws = XLSX.utils.json_to_sheet(deviceData.data);
      XLSX.utils.book_append_sheet(wb, ws, deviceData.deviceName);
    }

    const wbout = XLSX.write(wb, { type: "binary", bookType: "xlsx" });
    RNFS.mkdir(directory);
    const filename = directory + FileExportService.getFilename() + ".xlsx";
    writeFile(filename, wbout, "ascii")
      .then(() => {
        Toast.show("File saved to " + filename, Toast.LONG);
      })
      .catch((e) => {
        Toast.show("Can not save file: " + e, Toast.LONG);
      });
  }
}
