import React, { useContext, useState } from 'react';
import RNFS from 'react-native-fs';

const ConfigContext = React.createContext();
const ConfigUpdateContext = React.createContext();

/**
 * Default configuration
 */
export const defaultConfig = {
  screenName: '',
  mode: 'client',
  devices: [],
  gatewayInterval: '10',
  ipSuffix: '68',
  networkPort: '502',
  exportDirectory: RNFS.ExternalStorageDirectoryPath + '/THSControllerExport/',
};

/**
 * Hook allowing to get and set config context
 * Config context is used to store state shared between components
 */
export const useConfig = () => {
  return {
    config: useContext(ConfigContext),
    setConfig: useContext(ConfigUpdateContext),
  };
};

/**
 * Config context provider
 * @param children children elements
 */
const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultConfig);

  return (
    <ConfigContext.Provider value={config}>
      <ConfigUpdateContext.Provider value={setConfig}>
        {children}
      </ConfigUpdateContext.Provider>
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;
