import ModbusProvider from "./ModbusProvider";

export default class ModbusService {
    static MAX_RETRIES = 3;
    static RETRY_TIMEOUT = 1000;

    static checkRead(read) {
        return read && 
            read[0] === "[" && 
            read[read.length - 1] === "]" &&
            !isNaN(parseInt(read.toString().substring(1, read.length - 1)));
    }

    static parseTemperature = (read) => {
        var str = read.toString().substring(1, read.length - 1);
        var value = parseInt(str);
        return value / 10;
      };

    static retry = (fn) => {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(fn);
            }, this.RETRY_TIMEOUT);
        });
    }

    //TODO generalize, allow reading RH
    static async readTemperature(ip, retryNumber) {
        if (retryNumber && retryNumber > this.MAX_RETRIES) {
            console.error("Max retry count reached, giving up");
            return 0;
        }
        try {
            var connectLog = await ModbusProvider.connect(ip, 502);
            var value = await ModbusProvider.read(0);
            var disconnectLog = await ModbusProvider.disconnect();
            if (this.checkRead(value)) {
                return this.parseTemperature(value);
            } else {
                console.warn("Retrying cause of error: " + connectLog + " / "+ value + " / " + disconnectLog + new Date());
                return await this.retry(this.readTemperature(ip, retryNumber ? retryNumber + 1 : 1));
            }
        } catch (error) {
            console.error("Error reading temperature from sensor: " + error);
        }
    };

    //TODO generalize
    static async writeTemperatureCorrection(ip, correction) {
        try {
            var connectLog = await ModbusProvider.connect(ip, 502);
            console.log(connectLog);
            var value = await ModbusProvider.write(2000, correction);
            console.log(value);
            var disconnectLog = await ModbusProvider.disconnect();
            console.log(disconnectLog);
        } catch (error) {
            console.error("Error sending command: " + error);
        }
    };
}