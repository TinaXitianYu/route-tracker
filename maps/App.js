import MapView, { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// export default function App() {
//   const [mapRegion, setMapRegion] = useState(null);
//   const [errorMsg, setErrorMsg] = useState(null);
export default function App() {
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  Location.setGoogleApiKey("AIzaSyD5GUOMMrDY5Ml8JOQ5j7z7p9f8GaGCDBg");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
  
      let locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // Time between updates in milliseconds
          distanceInterval: 1, // Minimum distance in meters to trigger an update
        },
        (newLocation) => {
          setLocation(newLocation);

          setMapRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });

          console.log("Updated Location:", newLocation);
        }
      );
  
      return () => {
        if (locationSubscription) {
          locationSubscription.remove(); // Clean up the subscription
        }
      };
    })();
  }, []);
  
  

  if (!mapRegion) {
    // Display loading message or error until the mapRegion is set
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        {errorMsg ? (
          <Text>{errorMsg}</Text>
        ) : (
          <Text>Fetching location...</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <MapView style={styles.map} region={mapRegion}>
        <Marker coordinate={mapRegion} title="Your Location" />
      </MapView>
      {errorMsg && <Text>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

