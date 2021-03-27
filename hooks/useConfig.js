import React, { useContext, useState } from 'react';

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
        devices: []
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