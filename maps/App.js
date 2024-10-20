import React, { useState, useEffect } from 'react';
import "'@/global.css'";
import { GluestackUIProvider } from "@/'components/ui'/gluestack-ui-provider";
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, Button, Text } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [mapRegion, setMapRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const userLocation = async () => {
    try {
      // Directly fetch the user's current position
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,  // You can also try Location.Accuracy.BestForNavigation for maximum precision
        enableHighAccuracy: true,
        timeout: 5000,  // Set a timeout to prevent long waiting if GPS takes too long
      });

      // Update map region state with the fetched location
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Log the exact coordinates for debugging
      console.log('Latitude:', location.coords.latitude, 'Longitude:', location.coords.longitude);
    } catch (error) {
      // Log and handle any errors
      setErrorMsg("Error fetching location: " + error.message);
      console.log('Error fetching location:', error);
    }
  };

  useEffect(() => {
    // Call userLocation function on component mount
    userLocation();
  }, []);

  if (!mapRegion) {
    return (
      <GluestackUIProvider mode="light"><View style={styles.container}>
          {errorMsg ? <Text>{errorMsg}</Text> : <Text>Fetching location...</Text>}
          <Button title="Retry Location" onPress={userLocation} />
        </View></GluestackUIProvider>
    ); // Avoid rendering the map until the location is set
  }

  return (
    <GluestackUIProvider mode="light"><View style={styles.container}>
        <MapView style={styles.map} region={mapRegion}>
          <Marker coordinate={mapRegion} title="Your Location" />
        </MapView>
        <Button title="Retry Location" onPress={userLocation} />
      </View></GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
