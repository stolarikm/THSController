export default function() {
    return { 
        collection: (name) => { 
            if (name === "readings") {
                return {
                    doc: (email) => {
                        if (email === "test@test.com") {
                            return {
                                set: jest.fn(),
                                get: () => Promise.resolve({
                                    data: () => {
                                        return {
                                            commands: [],
                                            gatewayLock: null,
                                            devices: [{
                                                ip: "192.168.100.68",
                                                name: "Tester",
                                                readings: [{
                                                    time: { toDate: () => { return new Date(2021, 0, 1, 15); }},
                                                    temperature: 25.8,
                                                    humidity: 45.5
                                                },]
                                            },
                                            {
                                                ip: "192.168.100.69",
                                                name: "Fester",
                                                readings: [{
                                                    time: { toDate: () => { return new Date(2021, 0, 1, 16); }},
                                                    temperature: 25.4,
                                                    humidity: 46.9
                                                },]
                                            }]
                                        }
                                    }
                                })
                            }
                        } else {
                            return null;
                        }
                    }
                }
            } else {
                return null;
            }
        }
    }
}