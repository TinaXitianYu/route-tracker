import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, PanResponder, Animated, TextInput, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system'; // Import FileSystem
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import Foundation from '@expo/vector-icons/Foundation';

export default function App() {
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showInputs, setShowInputs] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isRecording, setIsRecording] = useState(false); // State to track recording
  const [gpxData, setGpxData] = useState(''); // State to hold GPX-like data

  const INITIAL_HEIGHT = 80;
  const MAX_HEIGHT = 250;
  const animatedHeight = useRef(new Animated.Value(INITIAL_HEIGHT)).current;

  Location.setGoogleApiKey("YOUR_GOOGLE_API_KEY"); // Replace with your Google API Key

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
          distanceInterval: 0,
        },
        (newLocation) => {
          setLocation(newLocation);
          setMapRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          });

          // If recording, update the GPX-like data
          if (isRecording) {
            const newGpxPoint = `
              <trkpt lat="${newLocation.coords.latitude}" lon="${newLocation.coords.longitude}">
                <ele>${newLocation.coords.altitude}</ele>
              </trkpt>`;
            setGpxData((prevData) => prevData + newGpxPoint);
          }
        }
      );

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    })();
  }, [isRecording]); // Add isRecording to the dependency array

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = INITIAL_HEIGHT - gestureState.dy;
        if (newHeight >= INITIAL_HEIGHT && newHeight <= MAX_HEIGHT) {
          animatedHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -50) {
          Animated.spring(animatedHeight, {
            toValue: MAX_HEIGHT,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(animatedHeight, {
            toValue: INITIAL_HEIGHT,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handlePlusPress = () => {
    if (showInputs) {
      Animated.timing(animatedHeight, {
        toValue: INITIAL_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowInputs(false);
      });
    } else {
      Animated.timing(animatedHeight, {
        toValue: MAX_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowInputs(true);
      });
    }
  };

  const handleRecordPress = async () => {
    setIsRecording((prev) => !prev); // Toggle recording state
    if (!isRecording) {
      setGpxData('<gpx>\n'); // Start GPX format
    } else {
      setGpxData((prevData) => prevData + '</gpx>'); // End GPX format
      await saveGpxData(); // Save data to file
    }
  };

  const saveGpxData = async () => {
    try {
      const directory = `${FileSystem.documentDirectory}sample_data`; // Path for sample_data folder
      const fileUri = `${directory}/location_data.txt`; // Full path for the file

      // Check if the directory exists
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(directory, { intermediates: true }); // Create directory if it doesn't exist
      }

      // Write the GPX data to the file
      await FileSystem.writeAsStringAsync(fileUri, gpxData);
      console.log('File saved successfully at:', fileUri);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

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

      {location && (
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationText}>
            Lat: {location.coords.latitude.toFixed(6)}, Long: {location.coords.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      <MapView style={styles.map} mapType={'standard'} region={mapRegion}>
        {location && (
          <Marker coordinate={mapRegion} title="Your Location">
            <Image
              source={{ uri: 'https://marcomm.washu.edu/app/uploads/2024/02/Athletic_Bear_Head_Logo_RGB-1024x847.png' }}
              style={styles.customMarker}
            />
          </Marker>
        )}
      </MapView>

      {errorMsg && <Text>{errorMsg}</Text>}

      {/* Draggable Upper Menu Bar */}
      <Animated.View
        style={[styles.menuUpperBar, { height: animatedHeight }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragIndicator} />

        <Animated.View style={[styles.contentContainer, {
          transform: [{
            translateY: animatedHeight.interpolate({
              inputRange: [INITIAL_HEIGHT, MAX_HEIGHT + 300],
              outputRange: [0, -40],
            }),
          }],
        }]}>
          <Text style={styles.routesText}>25 Routes</Text>
          <View style={styles.iconGroup}>
            <TouchableOpacity style={styles.iconButton} onPress={handlePlusPress}>
              <AntDesign name={showInputs ? "minuscircle" : "pluscircle"} size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome5 name="walking" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {showInputs && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Start"
              value={start}
              onChangeText={setStart}
            />
            <TextInput
              style={styles.input}
              placeholder="End"
              value={end}
              onChangeText={setEnd}
            />
            <TouchableOpacity style={styles.iconBelowInputs} onPress={handleRecordPress}>
              <Foundation name="record" size={40} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <View style={styles.menuLowerBar}>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="assistant-navigation" size={32} color="#a51417" />
          </View>
        </TouchableOpacity>

        <View style={styles.staticDivider} />

        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="schedule" size={32} color="#a51417" />
          </View>
        </TouchableOpacity>

        <View style={styles.staticDivider} />

        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.iconWrapper}>
            <FontAwesome name="user" size={32} color="#a51417" />
          </View>
        </TouchableOpacity>
      </View>
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
  locationTextContainer: {
    position: 'absolute',
    top: 40,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  locationText: {
    color: 'black',
    fontSize: 16,
  },
  menuUpperBar: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    backgroundColor: '#3d3d3d',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 2,
    paddingVertical: 10,
  },
  dragIndicator: {
    width: 75,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -37.5,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  routesText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  iconGroup: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    marginBottom: 10,
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  menuLowerBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 80,
    zIndex: 1,
  },
  menuButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  iconWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staticDivider: {
    width: 1,
    backgroundColor: '#ccc',
    height: 60,
    alignSelf: 'center',
  },
  customMarker: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
