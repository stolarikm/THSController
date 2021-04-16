import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, processColor, StatusBar, Text } from 'react-native';
import { Card, Title, Checkbox, Button, Switch } from 'react-native-paper';
import { LineChart } from 'react-native-charts-wrapper';
import { useOrientation } from '../hooks/useOrientation';
import firestore from '@react-native-firebase/firestore';
import { useConfig } from '../hooks/useConfig';
import NavigationBar from 'react-native-navbar-color'
import FileExportService from '../services/FileExportService';
import auth from '@react-native-firebase/auth';
import { Select } from '../components/DropDown';

export default function MonitorScreen({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  const availableColors =  ['cornflowerblue',
                            'brown',
                            'darkgoldenrod',
                            'aquamarine',
                            'coral',
                            'chartreuse',
                            'dimgray',
                            'floralwhite',
                            'darkorchid',
                            'magenta'];

  useEffect(() => {
    firestore().settings = {  };
    var unsubscribe = firestore().collection("readings")
      .onSnapshot((snapshot) => {
        if (snapshot) {
          //should be only 1 document
          snapshot.forEach((doc) => {
            if (doc.id === user.email) {
              let data = doc.data();
              let colorGenerator = generateColors(0);
              data.devices.forEach(d => {
                d.color = colorGenerator.next().value;
                d.selected = true;
              });
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
  const [graphTimeline, setGraphTimeline] = useState([]);
  const [graphDataSets, setGraphDataSets] = useState([]);
  const [isHumidity, setisHumidity] = useState(false);
  const { config, setConfig } = useConfig();
  const isPortrait = useOrientation();
  const [filter, setFilter] = useState('none');

  useEffect(() => { //TODO refactor
    const unsubscribe = navigation.addListener('focus', () => {
      let newConfig = {
        ...config,
        screenName: "Monitor"
      };
      setConfig(newConfig);
    });

    return unsubscribe;
  }, [navigation, config]);

  useEffect(() => { 
    let timeline = generateTimeLine();
    setGraphTimeline(timeline);
    setGraphDataSets(getReadingsByDevices(timeline));
  }, [readings]);

  function* generateColors(i) {
    while (true) {
      yield availableColors[i % availableColors.length];
      i++;
    }
  }

  const getReadingsByDevices = (timeline) => {
    let map = {};
    for (device of readings.devices) {
      let result = [];
      for (time of timeline) {
        var deviceValue = device.readings.find(r => {
          return time.getTime() === r.time.toDate().getTime();
        });
        result.push(deviceValue ? deviceValue : null);
      }
      map[device.ip] = result;
    }
    return map;
  }

  const getTemperatureReadingsOfDevice = (ip) => {
    var deviceData = graphDataSets[ip];
    if (!deviceData) {
      return [];
    }
    return deviceData.map(r => r ? r.temperature : null);
  }

  const getHumidityReadingsOfDevice = (ip) => {
    var deviceData = graphDataSets[ip];
    if (!deviceData) {
      return [];
    }
    return deviceData.map(r => r ? r.humidity : null);
  }

  const selectDevice = (ip) => {
    var newReadings = { ...readings };
    var device = newReadings.devices.find(device => device.ip === ip);
    if (device) {
      device.selected = !device.selected;
    }
    setReadings(newReadings);
  }

  const getDataSets = () => {
    return readings.devices
      .filter(device => device.selected)
      .map(device => {
        return { 
          config: lineConfig(device.color), 
          label: device.name,
          values: isHumidity ? getHumidityReadingsOfDevice(device.ip) : getTemperatureReadingsOfDevice(device.ip) };
      });
  }

  const getLabels = () => {
    return {
      valueFormatter: graphTimeline.map(parseTime),
      drawLabels: true,
      position: "BOTTOM",
      granularityEnabled: true,
      granularity: 1,
      labelCount: isPortrait ? 3 : 8,
      centerAxisLabels: true
    }
  }

  const getBoundaries = () => {
    let firstTimestamp = new Date(9999, 1, 1);
    let lastTimestamp = new Date(1, 1, 1);
    if (readings && readings.devices.length > 0) {
      for (device of readings.devices) {
        for (reading of device.readings) {
          let readingTime = reading.time.toDate();
          if (readingTime < firstTimestamp) {
            firstTimestamp = readingTime;
          }
          if (readingTime > lastTimestamp) {
            lastTimestamp = readingTime;
          }
        }
      }
    }
    return { firstTimestamp, lastTimestamp };
  }


  const generateTimeLine = () => {
    let boundaries = getBoundaries();
    if (!boundaries) {
      return [];
    }
    let result = [];
    let currentTime = boundaries.firstTimestamp;
    let endTime = boundaries.lastTimestamp;
    while (currentTime <= endTime) {
      result.push(new Date(currentTime));
      currentTime.setSeconds(currentTime.getSeconds() + 1);
    }
    return result;
  }

  const parseTime = (date) => {
    return date.getDate() + "." + (date.getMonth() + 1) + ". " + date.toTimeString().split(' ')[0];
  }

  const shouldShowGraph = () => {
    return readings.devices
      .some(device => device.selected);
  }

  const filters = [
    {label: "None", value: "none"},
    {label: "Last hour", value: "hour"},
    {label: "Last day", value: "day"},
    {label: "Last week", value: "week"},
    {label: "Last month", value: "month"}
  ];

  return (
    <>
      <View style={styles.container}>
        <View style={!isPortrait ? {display: 'none'} : {}}>
          <View style={{flex: 1, alignItems: 'center'}}>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <Text style={{ fontWeight: !isHumidity ? 'bold' : 'normal', fontSize: 16, margin: 5 }}>Temperature</Text>
              <Switch value={isHumidity} onValueChange={() => setisHumidity(!isHumidity)} trackColor={{true: 'lightgrey', false: 'lightgrey'}} thumbColor='#67daff'/>
              <Text style={{ fontWeight: isHumidity ? 'bold' : 'normal', fontSize: 16, margin: 5, paddingRight: 30 }}>Humidity</Text>
            </View>
          </View>
          <View style={{flex: 9 }}>
            <ScrollView contentContainerStyle={{alignItems: 'center'}}>
              <View style={{ flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center'}}>
                {readings && readings.devices.map((device, index) => {
                  if (device.readings && device.readings.length > 0) {
                    return (
                      <Card key={index} style={{margin: 10, width: '41%'}} onPress={() => selectDevice(device.ip)}>
                        <Card.Content>
                          <View style={device.selected ? { borderBottomColor: device.color, borderBottomWidth: 3 } : {}}>
                            <View style={{flexDirection: 'row'}}>
                              <View style={{flex: 2, transform: [{ translateX: -10 }]}}>
                                <Checkbox 
                                  status={device.selected ? 'checked' : 'unchecked'}
                                  onPress={() => selectDevice(device.ip)}
                                />
                              </View>
                              <View style={{flex: 7}}>
                                {  isHumidity && <Title>{device.readings[device.readings.length - 1].humidity}%</Title>}
                                { !isHumidity && <Title>{device.readings[device.readings.length - 1].temperature} °</Title>}
                              </View>
                            </View>
                            <Text numberOfLines={1} style={{ paddingBottom: 5}}>{device.name}</Text>
                          </View>
                        </Card.Content>
                      </Card>
                    );
                  }
                })}
              </View>
            </ScrollView>
          </View>
          <View style={{flex: 7}}></View>
        </View>
        <View style={{ marginBottom: 10, position: 'absolute', bottom: 0, height: isPortrait ? 280 : '100%', width: '100%'}}>
          <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
            <Button 
              icon="file" 
              disabled={readings.devices.length === 0}
              onPress={() => FileExportService.exportToExcel(readings.devices, config.exportDirectory)} 
              style={{alignSelf: 'flex-start', display: !isPortrait ? 'none' : 'flex' }}>
              Export
            </Button>
            <View style={{width: 125}}>
            <Select
              label='Filter'
              value={filter}
              setValue={setFilter}
              data={filters}
            />
            </View>
          </View>
          {shouldShowGraph() &&
            <LineChart
              marker={{ enabled: true, digits: 1 }}
              legend={{ enabled: false }}
              chartDescription={{ text: '' }}
              style={styles.chart}
              data={{ dataSets: getDataSets() }}
              xAxis={getLabels()}
            />
          }
          {!shouldShowGraph() &&
            <View style={{alignItems: 'center', paddingTop: '20%'}}>
              <Text>No data to show</Text>
            </View>
          }
        </View>
      </View>
      </>
  );
}

const lineConfig = (color) => {
  return {
    lineWidth: 2,
    drawCircleHole: false,
    drawCircles: false,
    circleRadius: 0,
    drawValues: false,
    color: processColor(color),
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    flex: 1,
  }
});