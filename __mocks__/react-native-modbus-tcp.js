export default {
    connectToModbusMaster: (ip, port, fn) => {
        if (ip === "192.168.100.68" && port === "502") {
            fn("success");
        } else {
            fn("error");
        }
    },
    destroyConnection: (fn) => fn(),
    readHoldingRegisters: (id, address, id2, fn) => {
        if (address === 0) {
            fn("[258]");
        } else if (address === 10) {
            fn("[523]");
        } else {
            fn(0);
        }
    },
    writeRegister: (id, address, value, fn) => {
        if (address === 2000) {
            fn("success");
        } else {
            fn("error");
        }
    }
}