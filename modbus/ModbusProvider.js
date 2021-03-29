import ModbusTcp from "react-native-modbus-tcp";

export default class ModbusProvider {
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
}