import ModbusProvider from "./ModbusProvider";

export default class ModbusService {

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
    static async read(ip) {
            await ModbusProvider.connect(ip, 502);
            var temp = await ModbusProvider.read(0);   //temperature register
            var rh = await ModbusProvider.read(10);  //RH register
            await ModbusProvider.disconnect();
            return {
                temperature: this.validateRead(temp) ? this.parseRead(temp) : 0,
                humidity: this.validateRead(rh) ? this.parseRead(rh) : 0,
            }
    };

    //TODO generalize
    static async writeTemperatureCorrection(ip, correction) {
        try {
            var connectLog = await ModbusProvider.connect(ip, 502);
            var value = await ModbusProvider.write(2000, correction);
            console.log(value);
            var disconnectLog = await ModbusProvider.disconnect();
        } catch (error) {
            console.error("Error sending command: " + error);
        }
    };

    static async isDevicePresent(ip) {
        try {
            await ModbusProvider.connect(ip, 502);
            await ModbusProvider.disconnect();
            return true;
        } catch (error) {
            return false;
        }
    };
}