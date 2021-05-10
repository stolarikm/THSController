import ModbusTcp from "react-native-modbus-tcp";

/**
 * Service module for communicating with the sensor devices
 * This module uses Modbus TCP protocol
 */
export default class ModbusService {
  // connection state
  static connected = false;

  // password for writing into control register
  // represents binary 10100101 in Most Significant Byte
  static password = 42240;

  // represents 0th bit set to 1
  static reinitBit = 1;

  /**
   * Connects to a Modbus slave device
   * @param ip ip address of the device
   * @param port port to communicate on
   */
  static connect(ip, port) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        ModbusTcp.connectToModbusMaster(ip, port, (res) => {
          if (res.includes("success")) {
            this.connected = true;
            resolve(res);
          } else {
            reject();
          }
        });
      } else {
        reject("Connected already");
      }
    });
  }

  /**
   * Disconnects from a Modbus slave device
   */
  static disconnect() {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        ModbusTcp.destroyConnection((res) => {
          this.connected = false;
          resolve(res);
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Reads a value from register of currently connected Modbus device
   * @param address register address
   */
  static read(address) {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        ModbusTcp.readHoldingRegisters(1, address, 1, (res) => {
          resolve(res);
        });
      } else {
        reject("Not connected");
      }
    });
  }

  /**
   * Writes a value to a register of currently connected Modbus device
   * @param address register address
   * @param value value to write
   */
  static write(address, value) {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        ModbusTcp.writeRegister(1, address, value, (res) => {
          resolve(res);
        });
      } else {
        reject("Not connected");
      }
    });
  }

  /**
   * Validates the data received from reading a register
   * of currently connected Modbus device
   * Returns true if the validation passed, false otherwise
   * @param read received data
   */
  static validateRead(read) {
    return (
      read &&
      read[0] === "[" &&
      read[read.length - 1] === "]" &&
      !isNaN(parseInt(read.toString().substring(1, read.length - 1)))
    );
  }

  /**
   * Parses a value from data received from reading a register
   * of currently connected Modbus device
   * @param read data received
   */
  static parseRead = (read) => {
    var str = read.toString().substring(1, read.length - 1);
    var value = parseInt(str);
    return value / 10;
  };

  /**
   * Reads temperature and humidity from respective registers
   * of currently connected Modbus slave device
   * @param ip ip address of the device
   * @param port port to communicate on
   */
  static async readTemperatureAndHumidity(ip, port) {
    await this.connect(ip, port);
    var temp = await this.read(0); // temperature register
    var rh = await this.read(10); // RH register
    await this.disconnect();
    return {
      temperature: this.validateRead(temp) ? this.parseRead(temp) : 0,
      humidity: this.validateRead(rh) ? this.parseRead(rh) : 0,
    };
  }

  /**
   * Sends a command to currently connected Modbus slave device
   * @param ip ip address of the target device
   * @param port port to communicate on
   * @param command command to send
   */
  static async sendCommand(ip, port, command) {
    try {
      var deviceCommand = this.preprocessCommand(command);
      var connectLog = await this.connect(ip, port);
      var response = await this.write(
        deviceCommand.register,
        deviceCommand.value
      );
      var disconnectLog = await this.disconnect();
    } catch (error) {
      console.error("Error sending command: " + error);
    }
  }

  /**
   * Preprocesses the command data value to a format specified by respective register
   * @param command command data
   */
  static preprocessCommand(command) {
    var processedCommand = { ...command };
    switch (processedCommand.command) {
      case "temp_corr":
      case "humidity_corr":
        //to tenths
        processedCommand.value = Math.floor(
          parseFloat(processedCommand.value) * 10
        );
        return processedCommand;
      case "temp_units":
        //to ASCII code
        processedCommand.value = processedCommand.value.charCodeAt(0);
        return processedCommand;
      case "reinit":
        //reinitBit with password protection
        var passwordProtectedValue = this.password + this.reinitBit;
        processedCommand.value = passwordProtectedValue;
        return processedCommand;
      default:
        return processedCommand;
    }
  }

  /**
   * Checks whether a Modbus device is present on ip address and port
   * Returns true if device is present, false otherwise
   * @param ip ip address to check
   * @param port port to communicate on
   * @returns
   */
  static async isDevicePresent(ip, port) {
    try {
      await this.connect(ip, port);
      await this.disconnect();
      return true;
    } catch (error) {
      return false;
    }
  }
}
