import ModbusTcp from "react-native-modbus-tcp";

export default class ModbusProvider {
    static ERROR_STRING_CONNECT = "Modbus4Andriod initialization failure";  //TODO iOS

    static connected = false;

    static connect(ip, port) {
        return new Promise((resolve, reject) => {
            if (this.connected) return reject("Already connected");
            ModbusTcp.connectToModbusMaster(ip, port, (res) => {
                if (res === this.ERROR_STRING_CONNECT) return reject(res);
                this.connected = true;
                resolve(res);
            });
        });
    };

    static disconnect() {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject("Not connected");
            ModbusTcp.destroyConnection((res) => {
                this.connected = false;
                resolve(res);
            });
        });
    };

    static read(address) {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject("Not connected");
            ModbusTcp.readHoldingRegisters(1, address, 1, (res) => {
                resolve(res);
            });
        });
    };
}