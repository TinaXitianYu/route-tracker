import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, PanResponder, Animated } from 'react-native'; 
import MapView, { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function App() {
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Define the initial and maximum height for the menu bar
  const INITIAL_HEIGHT = 100;
  const MAX_HEIGHT = 150; // Maximum height the menu bar can expand to

  // Animated height and opacity for the menu bar and text
  const animatedHeight = useRef(new Animated.Value(INITIAL_HEIGHT)).current;
  const textOpacity = useRef(new Animated.Value(0)).current; // Initial opacity for the text

  Location.setGoogleApiKey("YOUR_GOOGLE_API_KEY");

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
          timeInterval: 500,
          distanceInterval: 3,
        },
        (newLocation) => {
          setLocation(newLocation);

          setMapRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          });
        }
      );

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    })();
  }, []);

  // PanResponder to handle touch gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Calculate the new height based on the drag distance
        const newHeight = INITIAL_HEIGHT - gestureState.dy;
        // Limit the new height to be within bounds
        if (newHeight >= INITIAL_HEIGHT && newHeight <= MAX_HEIGHT) {
          animatedHeight.setValue(newHeight);
          // Adjust text opacity based on the height
          const opacityValue = Math.min(1, (newHeight - INITIAL_HEIGHT) / (MAX_HEIGHT - INITIAL_HEIGHT));
          textOpacity.setValue(opacityValue); // Set opacity
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If dragged up sufficiently, snap to max height
        if (gestureState.dy < -50) { // Adjust this threshold as needed
          Animated.parallel([
            Animated.spring(animatedHeight, {
              toValue: MAX_HEIGHT,
              useNativeDriver: false,
            }),
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: 200, // Fade in duration
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          // Snap back to initial height
          Animated.parallel([
            Animated.spring(animatedHeight, {
              toValue: INITIAL_HEIGHT,
              useNativeDriver: false,
            }),
            Animated.timing(textOpacity, {
              toValue: 0,
              duration: 200, // Fade out duration
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  if (!mapRegion) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        {errorMsg ? <Text>{errorMsg}</Text> : <Text>Fetching location...</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <MapView style={styles.map} mapType={'standard'} region={mapRegion}>
        <Marker coordinate={mapRegion} title="Your Location" />
      </MapView>

      {errorMsg && <Text>{errorMsg}</Text>}

      {/* Menu Bar */}
      <Animated.View
        style={[styles.menuBar, { height: animatedHeight }]}
        {...panResponder.panHandlers} // Attach PanResponder handlers
      >
        <TouchableOpacity style={[styles.menuButton, styles.menuButtonWithSeparator]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="assistant-navigation" size={32} color="#a51417" />
          </View>
          <Text style={styles.menuText}>Navigate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuButton, styles.menuButtonWithSeparator]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="schedule" size={32} color="#a51417" />
          </View>
          <Text style={styles.menuText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.iconContainer}>
            <FontAwesome name="user" size={32} color="#a51417" />
          </View>
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Powered By Text */}
      <Animated.View style={{ opacity: textOpacity, position: 'absolute', bottom: INITIAL_HEIGHT + 25, alignSelf: 'center' }}>
        <Text style={styles.poweredByText}>Powered by XYZ API</Text>
      </Animated.View>
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
  menuBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center', // Center vertically
  },
  menuButton: {
    flex: 1,
    justifyContent: 'center', // Center contents vertically
    alignItems: 'center',
    paddingVertical: 10, // Provide vertical padding
  },
  menuButtonWithSeparator: {
    borderRightWidth: 1,
    borderColor: '#ccc', // Light grey color for the separator
  },
  menuText: {
    fontSize: 16,
    marginTop: 5, // Add margin to create space between text and icon
  },
  iconContainer: {
    justifyContent: 'center', // Center the icon
    alignItems: 'center',
    marginBottom: 5, // Add margin below the icon for spacing
  },
  poweredByText: {
    fontSize: 12,
    color: '#888', // Gray color for the powered by text
    textAlign: 'center',
  },
});
