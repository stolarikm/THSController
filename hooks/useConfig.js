import React, { useContext, useState } from 'react';
import RNFS from 'react-native-fs';

const ConfigContext = React.createContext();
const ConfigUpdateContext = React.createContext();

export const useConfig = () => {
    return { 
        config: useContext(ConfigContext),
        setConfig: useContext(ConfigUpdateContext)
    };
}

const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState({
        screenName: "",
        mode: "client",
        devices: [],
        gatewayInterval: "30",
        ipSuffix: "68",
        networkPort: "502",
        exportDirectory: RNFS.ExternalStorageDirectoryPath + '/THSControllerExport/'
    });
  
    return (
        <ConfigContext.Provider value = {config}>
            <ConfigUpdateContext.Provider value = {setConfig}>
                {children}
            </ConfigUpdateContext.Provider>
        </ConfigContext.Provider>   
    ); 
}

export default ConfigProvider;