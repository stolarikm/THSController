import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  processColor,
  StatusBar,
  Text,
} from 'react-native';
import {
  Card,
  Title,
  Checkbox,
  Button,
  Switch,
  IconButton,
} from 'react-native-paper';
import { LineChart } from 'react-native-charts-wrapper';
import { useOrientation } from '../hooks/useOrientation';
import firestore from '@react-native-firebase/firestore';
import { useConfig } from '../hooks/useConfig';
import NavigationBar from 'react-native-navbar-color';
import FileExportService from '../services/FileExportService';
import auth from '@react-native-firebase/auth';
import FilterDialog from '../components/FilterDialog';
import NoDataComponent from '../components/NoDataComponent';

const availableColors = [
  'cornflowerblue',
  'brown',
  'darkgoldenrod',
  'aquamarine',
  'coral',
  'chartreuse',
  'salmon',
  'teal',
  'darkorchid',
  'magenta',
];

function* generateColors(i) {
  while (true) {
    yield availableColors[i % availableColors.length];
    i++;
  }
}

const colorGenerator = generateColors(0);

export default function MonitorScreen({ navigation }) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  useEffect(() => {
    var unsubscribe = firestore()
      .collection('readings')
      .onSnapshot((snapshot) => {
        if (snapshot) {
          //should be only 1 document
          snapshot.forEach((doc) => {
            if (doc.id === user.email) {
              let data = doc.data();
              setReadings(data);
            }
          });
        }
      });
    //cleanup
    return unsubscribe;
  }, []);

  const user = auth().currentUser;
  const [readings, setReadings] = useState({ devices: [] });
  const [isHumidity, setisHumidity] = useState(false);
  const { config, setConfig } = useConfig();
  const isPortrait = useOrientation();
  const [filter, setFilter] = useState('none');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [deviceColors, setDeviceColors] = useState({});
  const graph = useRef(null);

  useEffect(() => {
    //TODO refactor
    const unsubscribe = navigation.addListener('focus', () => {
      let newConfig = {
        ...config,
        screenName: 'Monitor',
      };
      setConfig(newConfig);
    });

    return unsubscribe;
  }, [navigation, config]);

  useEffect(() => {
    if (!readings || !readings.devices || readings.devices.length === 0) {
      setSelectedDevices([]);
      setDeviceColors([]);
    }
    if (readings && readings.devices && readings.devices.length > 0) {
      var newColors = { ...deviceColors };
      var newSelectedDevices = [...selectedDevices];
      var shouldUpdate = false;
      for (device of readings.devices) {
        if (!deviceColors[device.ip]) {
          shouldUpdate = true;
          //add color to new devices
          newColors[device.ip] = colorGenerator.next().value;
          //defaultly select new devices
          newSelectedDevices.push(device.ip);
        }
      }
      if (shouldUpdate) {
        setDeviceColors(newColors);
        setSelectedDevices(newSelectedDevices);
      }
    }
  }, [readings]);

  const deselectGraph = () => {
    if (graph && graph.current) {
      graph.current.highlights([]);
    }
  };

  const selectDevice = (ip) => {
    deselectGraph();
    var newSelectedDevices = [...selectedDevices];
    if (newSelectedDevices.includes(ip)) {
      newSelectedDevices = newSelectedDevices.filter((d) => d !== ip);
    } else {
      newSelectedDevices.push(ip);
    }
    setSelectedDevices(newSelectedDevices);
  };

  const isDeviceSelected = (ip) => {
    return selectedDevices.includes(ip);
  };

  const getDeviceColor = (ip) => {
    return deviceColors[ip] ? deviceColors[ip] : 'grey';
  };

  const getDataSet = (ip) => {
    var device = readings.devices.find((d) => d.ip === ip);
    if (!device) {
      return [];
    }
    var lowerBound = getFilterBoundary();
    return device.readings
      .filter((r) => {
        return r.time.toDate() >= lowerBound;
      })
      .map((r) => (isHumidity ? r.humidity : r.temperature));
  };

  const isSingleData = () => {
    return devicesAvailable() && readings.devices[0].readings.length === 1;
  };

  const isSingleOrDoubleData = () => {
    return devicesAvailable() && readings.devices[0].readings.length <= 2;
  };

  const getDataSets = () => {
    if (!devicesAvailable()) {
      return [];
    }
    return readings.devices
      .filter((device) => isDeviceSelected(device.ip))
      .map((device) => {
        return {
          config: lineConfig(getDeviceColor(device.ip), isSingleData()),
          label: device.name,
          values: getDataSet(device.ip),
        };
      });
  };

  const getLabelArray = () => {
    if (!devicesAvailable()) {
      return [];
    }
    var lowerBound = getFilterBoundary();
    return readings.devices[0].readings
      .filter((r) => r.time.toDate() >= lowerBound)
      .map((r) => parseLabel(r.time.toDate()));
  };

  const parseLabel = (date) => {
    return (
      date.getDate() +
      '.' +
      (date.getMonth() + 1) +
      '. ' +
      date.toTimeString().split(' ')[0]
    );
  };

  const getLabels = () => {
    return {
      valueFormatter: getLabelArray(),
      drawLabels: true,
      position: 'BOTTOM',
      granularityEnabled: true,
      granularity: 1,
      labelCount: isPortrait ? 5 : 7,
      centerAxisLabels: !isSingleOrDoubleData(),
      avoidFirstLastClipping: isSingleOrDoubleData(),
      labelRotationAngle: isPortrait ? 12 : 0,
    };
  };

  const getFilterBoundary = () => {
    let result = new Date();
    result.setMilliseconds(0);
    switch (filter) {
      case 'minute':
        result.setMinutes(result.getMinutes() - 1);
        break;
      case 'hour':
        result.setHours(result.getHours() - 1);
        break;
      case 'day':
        result.setDate(result.getDate() - 1);
        break;
      case 'week':
        result.setDate(result.getDate() - 7);
        break;
      case 'month':
        result.setDate(result.getDate() - 30);
        break;
      default:
        return new Date(1, 1, 1);
    }
    return result;
  };

  const shouldShowGraph = () => {
    return selectedDevices.length > 0;
  };

  const devicesAvailable = () => {
    return readings && readings.devices && readings.devices.length > 0;
  };

  return (
    <>
      {!devicesAvailable() && <NoDataComponent />}
      {devicesAvailable() && (
        <View style={styles.container}>
          <View
            style={{
              flex: 6,
              display: !isPortrait ? 'none' : 'flex',
              width: '100%',
            }}
          >
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: !isHumidity ? 'bold' : 'normal',
                    fontSize: 16,
                    margin: 5,
                  }}
                >
                  {'Temperature '}
                </Text>
                <Switch
                  value={isHumidity}
                  onValueChange={() => setisHumidity(!isHumidity)}
                  trackColor={{ true: 'lightgrey', false: 'lightgrey' }}
                  thumbColor="#67daff"
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: isHumidity ? 'bold' : 'normal',
                    fontSize: 16,
                    margin: 5,
                    paddingRight: 30,
                  }}
                >
                  {'Humidity '}
                </Text>
              </View>
            </View>
            <View style={{ flex: 7, flexDirection: 'row', marginTop: 5 }}>
              <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  {readings &&
                    readings.devices.map((device, index) => {
                      if (device.readings && device.readings.length > 0) {
                        return (
                          <Card
                            key={index}
                            style={{
                              marginTop: 5,
                              marginBottom: 5,
                              marginLeft: 10,
                              marginRight: 10,
                              width: '41%',
                            }}
                            onPress={() => selectDevice(device.ip)}
                          >
                            <Card.Content>
                              <View
                                style={
                                  isDeviceSelected(device.ip)
                                    ? {
                                        borderBottomColor: getDeviceColor(
                                          device.ip
                                        ),
                                        borderBottomWidth: 3,
                                      }
                                    : {}
                                }
                              >
                                <View style={{ flexDirection: 'row' }}>
                                  <View
                                    style={{
                                      flex: 2,
                                      transform: [{ translateX: -10 }],
                                    }}
                                  >
                                    <Checkbox
                                      status={
                                        isDeviceSelected(device.ip)
                                          ? 'checked'
                                          : 'unchecked'
                                      }
                                      onPress={() => selectDevice(device.ip)}
                                    />
                                  </View>
                                  <View style={{ flex: 7 }}>
                                    {isHumidity && (
                                      <Title>
                                        {
                                          device.readings[
                                            device.readings.length - 1
                                          ].humidity
                                        }
                                        %
                                      </Title>
                                    )}
                                    {!isHumidity && (
                                      <Title>
                                        {
                                          device.readings[
                                            device.readings.length - 1
                                          ].temperature
                                        }{' '}
                                        °
                                      </Title>
                                    )}
                                  </View>
                                </View>
                                <Text
                                  numberOfLines={1}
                                  style={{ paddingBottom: 5 }}
                                >
                                  {device.name}
                                </Text>
                              </View>
                            </Card.Content>
                          </Card>
                        );
                      }
                    })}
                </View>
              </ScrollView>
            </View>
          </View>
          <View style={{ flex: 5, marginBottom: 10, width: '100%' }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: -10,
              }}
            >
              <Button
                icon="file"
                disabled={selectedDevices.length === 0}
                onPress={() => {
                  deselectGraph();
                  FileExportService.exportToExcel(
                    readings.devices,
                    config.exportDirectory,
                    getFilterBoundary(),
                    selectedDevices
                  );
                }}
                style={{ display: !isPortrait ? 'none' : 'flex' }}
              >
                Export
              </Button>
              <IconButton
                icon="cog"
                disabled={selectedDevices.length === 0}
                size={18}
                color="#1976d2"
                onPress={() => {
                  deselectGraph();
                  setFilterModalOpen(true);
                }}
                style={{ display: !isPortrait ? 'none' : 'flex' }}
              />
            </View>
            {shouldShowGraph() && (
              <LineChart
                marker={{ enabled: true, digits: 1 }}
                legend={{ enabled: false }}
                chartDescription={{ text: '' }}
                style={styles.chart}
                data={{ dataSets: getDataSets() }}
                xAxis={getLabels()}
                ref={graph}
              />
            )}
            {!shouldShowGraph() && (
              <View style={{ alignItems: 'center', paddingTop: '20%' }}>
                <Text>No data to show</Text>
              </View>
            )}
          </View>
          <FilterDialog
            visible={isPortrait && filterModalOpen}
            currentFilter={filter}
            close={() => {
              setFilterModalOpen(false);
            }}
            confirm={(f) => setFilter(f)}
          />
        </View>
      )}
    </>
  );
}

const lineConfig = (color, singleData) => {
  return {
    lineWidth: 2,
    drawCircleHole: false,
    drawCircles: singleData,
    circleColor: processColor(color),
    circleRadius: 0,
    drawValues: false,
    color: processColor(color),
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    flex: 1,
  },
});
