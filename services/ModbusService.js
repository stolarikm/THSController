import ModbusTcp from "react-native-modbus-tcp";

export default class ModbusService {
    static connected = false;

    //password for writing into control register
    //represents binary 10100101 in Most Significant Byte
    static password = 42240;
    //represents 0th bit set to 1
    static reinitBit = 1;

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
                reject();
            }
        });
    };

    static disconnect() {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                ModbusTcp.destroyConnection((res) => {
                    this.connected = false;
                    resolve(res);
                });
            }
        });
    };

    static read(address) {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                ModbusTcp.readHoldingRegisters(1, address, 1, (res) => {
                    resolve(res);
                });
            }
        });
    };

    static write(address, value) {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                ModbusTcp.writeRegister(1, address, value, (res) => {
                    resolve(res);
                });
            }
        });
    };

    static validateRead(read) {
        return read && 
            read[0] === "[" && 
            read[read.length - 1] === "]" &&
            !isNaN(parseInt(read.toString().substring(1, read.length - 1)));
    }

    static parseRead = (read) => {
        var str = read.toString().substring(1, read.length - 1);
        var value = parseInt(str);
        return value / 10;
    };

    static parseHumidity = (read) => {
        return read;
    };

    static async readTemperatureAndHumidity(ip, port) {
            await this.connect(ip, port);
            var temp = await this.read(0);   //temperature register
            var rh = await this.read(10);  //RH register
            await this.disconnect();
            return {
                temperature: this.validateRead(temp) ? this.parseRead(temp) : 0,
                humidity: this.validateRead(rh) ? this.parseRead(rh) : 0,
            }
    };

    static async sendCommand(ip, port, command) {
        try {
            var deviceCommand = this.preprocessCommand(command);
            var connectLog = await this.connect(ip, port);
            var response = await this.write(deviceCommand.register, deviceCommand.value);
            var disconnectLog = await this.disconnect();
        } catch (error) {
            console.error("Error sending command: " + error);
        }
    };

    static preprocessCommand(command) {
        var processedCommand = { ...command };
        switch(processedCommand.command) {
            case "temp_corr":
            case "humidity_corr":
              //to tenths
              processedCommand.value = Math.floor(parseFloat(processedCommand.value) * 10);
              return processedCommand;
            case "temp_units":
              //to ASCII code
              processedCommand.value = processedCommand.value.charCodeAt(0);  
              return processedCommand;
            case "reinit":
              //with password protection
              var passwordProtectedValue = this.password + this.reinitBit;
              processedCommand.value = passwordProtectedValue;
              return processedCommand;
            default:
                return processedCommand;
        } 
    }

    static async isDevicePresent(ip, port) {
        try {
            await this.connect(ip, port);
            await this.disconnect();
            return true;
        } catch (error) {
            return false;
        }
    };
}