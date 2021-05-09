import GetSubnetMask from 'react-native-get-subnet-mask';
import NetmaskModule from 'netmask';
import ModbusService from './ModbusService';

export default class NetworkScanService {
  static shouldStop = true;

  static getIp() {
    return new Promise((resolve, reject) => {
      GetSubnetMask.getIpV4((res) => {
        resolve(res);
      });
    });
  }

  static getSubnet() {
    return new Promise((resolve, reject) => {
      GetSubnetMask.getSubnet((res) => {
        resolve(res);
      });
    });
  }

  static ipComparator(ip1, ip2, commonIpSuffix) {
    var suffix1 = parseInt(ip1.split('.')[3]);
    var suffix2 = parseInt(ip2.split('.')[3]);
    var offset1 = suffix1 - commonIpSuffix;
    var offset2 = suffix2 - commonIpSuffix;
    if (offset1 < 0) {
      offset1 = offset1 + 255;
    }
    if (offset2 < 0) {
      offset2 = offset2 + 255;
    }
    return offset1 - offset2;
  }

  static async getAvailableIps(commonIpSuffix) {
    var ip = await NetworkScanService.getIp();
    var subnet = await NetworkScanService.getSubnet();
    var netmask = new NetmaskModule.Netmask(ip + '/' + subnet);
    var availableIps = [];
    netmask.forEach((availableIp) => availableIps.push(availableIp));
    availableIps.sort((ip1, ip2) =>
      NetworkScanService.ipComparator(ip1, ip2, commonIpSuffix)
    );
    return availableIps;
  }

  static async autoScan(processDeviceCallback, port, commonIpSuffix) {
    NetworkScanService.shouldStop = false;
    var index = 1;
    for (ip of await NetworkScanService.getAvailableIps(commonIpSuffix)) {
      if (NetworkScanService.shouldStop) {
        return;
      }
      if (await ModbusService.isDevicePresent(ip, port)) {
        var newDevice = { name: 'Device #' + index, ip: ip };
        index++;
        await processDeviceCallback(newDevice);
      }
    }
  }

  static stop() {
    NetworkScanService.shouldStop = true;
  }
}
