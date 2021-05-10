import GetSubnetMask from "react-native-get-subnet-mask";
import NetmaskModule from "netmask";
import ModbusService from "./ModbusService";

/**
 * Service module for scanning the network for devices
 * This module scans for Modbus slave devices
 */
export default class NetworkScanService {
  // flag to stop the asynchronous scanning
  static shouldStop = true;

  /**
   * Returns the IP address of current mobile device
   */
  static getIp() {
    return new Promise((resolve, reject) => {
      GetSubnetMask.getIpV4((res) => {
        resolve(res);
      });
    });
  }

  /**
   * Returns the subnet of current mobile device
   */
  static getSubnet() {
    return new Promise((resolve, reject) => {
      GetSubnetMask.getSubnet((res) => {
        resolve(res);
      });
    });
  }

  /**
   * Custom comparator used for sorting IP addresses to scan with ability
   * to set the IP address suffix (last tier) to start from to speed up the process
   * @param ip1 ip address to be compared
   * @param ip2 ip address to compare with
   * @param commonIpSuffix the last tier of IP address to start the scan from
   * @returns
   */
  static ipComparator(ip1, ip2, commonIpSuffix) {
    var suffix1 = parseInt(ip1.split(".")[3]);
    var suffix2 = parseInt(ip2.split(".")[3]);
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

  /**
   * Returns available IP addresses to scan
   * based on mobile device's IP address and subnet mask,
   * @param commonIpSuffix the last tier of IP address to start the scan from
   */
  static async getAvailableIps(commonIpSuffix) {
    var ip = await NetworkScanService.getIp();
    var subnet = await NetworkScanService.getSubnet();
    var netmask = new NetmaskModule.Netmask(ip + "/" + subnet);
    var availableIps = [];
    netmask.forEach((availableIp) => availableIps.push(availableIp));
    availableIps.sort((ip1, ip2) =>
      NetworkScanService.ipComparator(ip1, ip2, commonIpSuffix)
    );
    return availableIps;
  }

  /**
   * Starts the network scan process
   * @param processDeviceCallback callback called when a device is found
   * @param port port to communicate on
   * @param commonIpSuffix the last tier of IP address to start the scan from
   */
  static async autoScan(processDeviceCallback, port, commonIpSuffix) {
    NetworkScanService.shouldStop = false;
    var index = 1;
    for (ip of await NetworkScanService.getAvailableIps(commonIpSuffix)) {
      if (NetworkScanService.shouldStop) {
        return;
      }
      if (await ModbusService.isDevicePresent(ip, port)) {
        var newDevice = { name: "Device #" + index, ip: ip };
        index++;
        await processDeviceCallback(newDevice);
      }
    }
  }

  /**
   * Asynchronously stops the network scan process
   */
  static stop() {
    NetworkScanService.shouldStop = true;
  }
}
