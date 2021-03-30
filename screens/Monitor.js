import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, processColor, StatusBar } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { LineChart } from 'react-native-charts-wrapper';
import { useOrientation } from '../hooks/useOrientation';
import firestore from '@react-native-firebase/firestore';
import { useConfig } from '../hooks/useConfig';
import NavigationBar from 'react-native-navbar-color'
import FileExportService from '../services/FileExportService';

export default function Monitor({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  useEffect(() => {
    var unsubscribe = firestore().collection("readings")
      .onSnapshot((snapshot) => {
        var snapshotData = [];
        snapshot.forEach((doc) => snapshotData.push(doc.data()));
        setReadings(snapshotData);
      });
      //cleanup
      return unsubscribe;
  }, []);

  const [readings, setReadings] = useState([]);
  const { config, setConfig } = useConfig();
  const isPortrait = useOrientation();
  var screenWidth = Dimensions.get('window').width;
  var screenHeight = Dimensions.get('window').height;

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

  const getSensorIps = () => {
    var ips = new Set();
    readings.forEach(reading => reading.devices.forEach(device => ips.add(device.ip)));
    return ips;
  }

  const getReadings = (ip) => {
    var read = readings
      .filter(reading => reading.devices.some(device => device.ip === ip))
      .map(reading => reading.devices.filter(device => device.ip === ip)[0].value); //TODO fix [0]
    console.log("[Firebase]", read);
    return read;
  }

  return (
    <>
      <View style={styles.container}>
        <View style={{flex: 1}}>
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            {readings && readings.length > 0 && readings[readings.length - 1].devices.map((element, index) => {
              return (
                <Card key={index} style={{marginTop: 15, margin: 5}}>
                  <Card.Content>
                    <Title>{element.value} °C</Title>
                    <Paragraph>{element.name}</Paragraph>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        </View>
        <View style={{ marginBottom: 10, position: 'absolute', bottom: 0, height: isPortrait ? 250 : screenHeight, width: screenWidth }}>
          <Button 
            icon="file" 
            disabled={readings.length === 0}
            onPress={() => FileExportService.exportToExcel(readings)} 
            style={{alignSelf: 'flex-start'}}>
            Export
          </Button>
          <LineChart
            marker={{ enabled: true, digits: 1 }}
            xAxis={{
              valueFormatter: readings && readings.length > 0 ? readings.map((reading) => reading.time) : [],
              drawLabels: true,
              position: "BOTTOM",
            }}
            legend={{ enabled: false }}
            chartDescription={{ text: '' }}
            style={styles.chart}
            data={{
              dataSets: [...getSensorIps()].map((ip) => {
                return { config: lineConfig, label: ip, values: getReadings(ip) };
              }),
            }}
          />
        </View>
      </View>
      </>
  );
}

const lineConfig = {
  lineWidth: 2,
  drawCircleHole: false,
  drawCircles: false,
  circleRadius: 0,
  drawValues: false,
  color: processColor('#1976d2'),
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