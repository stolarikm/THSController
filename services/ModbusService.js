import ModbusTcp from "react-native-modbus-tcp";

export default class ModbusService {
    // provider functions
    static connected = false;

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

    // service functions
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

    //TODO generalize
    static async readTemperatureAndHumidity(ip) {
            await this.connect(ip, 502);
            var temp = await this.read(0);   //temperature register
            var rh = await this.read(10);  //RH register
            await this.disconnect();
            return {
                temperature: this.validateRead(temp) ? this.parseRead(temp) : 0,
                humidity: this.validateRead(rh) ? this.parseRead(rh) : 0,
            }
    };

    //TODO generalize
    static async writeTemperatureCorrection(ip, correction) {
        try {
            var connectLog = await this.connect(ip, 502);
            var value = await this.write(2000, correction);
            console.log(value);
            var disconnectLog = await this.disconnect();
        } catch (error) {
            console.error("Error sending command: " + error);
        }
    };

    static async isDevicePresent(ip) {
        try {
            await this.connect(ip, 502);
            await this.disconnect();
            return true;
        } catch (error) {
            return false;
        }
    };
}