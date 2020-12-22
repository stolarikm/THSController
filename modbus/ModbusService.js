import ModbusProvider from "./ModbusProvider";

export default class ModbusService {
    static async readTemperature(ip) {
        try {
            await ModbusProvider.connect(ip, 502);
            var value = await ModbusProvider.read(0);
            await ModbusProvider.disconnect();
            return value;
        } catch (error) {
            console.log("Error reading temperature from sensor: " + error);
        }
    };
}