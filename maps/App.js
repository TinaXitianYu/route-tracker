import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, PanResponder, Animated, TextInput, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function App() {
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showInputs, setShowInputs] = useState(false);
  const [showRouteInputs, setShowRouteInputs] = useState(false);
  const [showPolylineInputs, setShowPolylineInputs] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [gpxData, setGpxData] = useState('');
  const [routes, setRoutes] = useState([]); // To hold the loaded routes
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0); // Current route index
  const [showPolyline, setShowPolyline] = useState(false); // To control polyline visibility

  const [routeCur, setRouteCur] = useState(0); // Use a state variable
  const INITIAL_HEIGHT = 80;
  const MAX_HEIGHT = 250;
  const animatedHeight = useRef(new Animated.Value(INITIAL_HEIGHT)).current;

  Location.setGoogleApiKey("YOUR_GOOGLE_API_KEY");

  const route_0 = [
    // { latitude: 37.649103, longitude: -90.308248 },
  ];

  const route_1 = [
    { latitude: 38.649366, longitude: -90.310737 },
    { latitude: 38.649491, longitude: -90.309309 },
    { latitude: 38.648778, longitude: -90.308468 },
    { latitude: 38.649073, longitude: -90.307302 },
    // { latitude: 37.649103, longitude: -90.308248 },
  ];

  const route_2 = [
    { latitude: 38.649366, longitude: -90.310737 },
    // { latitude: 38.649491, longitude: -90.309309 },
    { latitude: 38.648778, longitude: -90.308468 },
    { latitude: 38.649073, longitude: -90.307302 },
    // { latitude: 37.649103, longitude: -90.308248 },
  ];

  const route_3 = [
    { latitude: 38.649366, longitude: -90.310737 },
    { latitude: 38.649491, longitude: -90.309309 },
    // { latitude: 38.648778, longitude: -90.308468 },
    { latitude: 38.649073, longitude: -90.307302 },
    // { latitude: 37.649103, longitude: -90.308248 },
  ];

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
  }, [isRecording]);

  useEffect(() => {
    // Load GPX-like files from the sample_data directory
    const loadRoutes = async () => {
      const directory = `${FileSystem.documentDirectory}sample_data`;
      const files = await FileSystem.readDirectoryAsync(directory);
      const loadedRoutes = await Promise.all(
        files.map(async (file) => {
          const fileUri = `${directory}/${file}`;
          const content = await FileSystem.readAsStringAsync(fileUri);
          return { name: file.replace('.txt', ''), path: parseGpxData(content) }; // Replace with proper route name parsing if needed
        })
      );
      setRoutes(loadedRoutes);
    };

    loadRoutes();
  }, []);

  const parseGpxData = (data) => {
    const regex = /<trkpt lat="([^"]+)" lon="([^"]+)">/g;
    const points = [];
    let match;
    while ((match = regex.exec(data))) {
      points.push({ latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) });
    }
    return points;
  };

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

  const handleConfirmStartEndNavPress = () => {
    if (showRouteInputs) {
      Animated.timing(animatedHeight, {
        // toValue: INITIAL_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowRouteInputs(false);
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

  const handleWalkingPress = () => {
    if (showPolylineInputs) {
      Animated.timing(animatedHeight, {
        toValue: INITIAL_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setRouteCur(0);
        setShowPolylineInputs(false);
      });
    }
    if (showRouteInputs) {
      Animated.timing(animatedHeight, {
        toValue: INITIAL_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowRouteInputs(false);
      });
    } else {
      Animated.timing(animatedHeight, {
        toValue: MAX_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowRouteInputs(true);
      });
    }
  };

  const handleWalkingConfirmPress = () => {
    if (showRouteInputs) {
      Animated.timing(animatedHeight, {
        toValue: INITIAL_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowRouteInputs(false);
      });
    }
    if (showPolylineInputs) {
      Animated.timing(animatedHeight, {
        toValue: INITIAL_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowPolylineInputs(false);
      });
    } else {
      Animated.timing(animatedHeight, {
        toValue: MAX_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowPolylineInputs(true);
      });
    }
  };



  const handleRecordPress = async () => {
    setIsRecording((prev) => !prev);
    if (!isRecording) {
      setGpxData('<gpx>\n');
    } else {
      setGpxData((prevData) => prevData + '</gpx>');
      await saveGpxData();
    }
  };

  const saveGpxData = async () => {
    try {
      const directory = `${FileSystem.documentDirectory}sample_data`;
      const fileUri = `${directory}/location_data.txt`;

      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      await FileSystem.writeAsStringAsync(fileUri, gpxData);
      console.log('File saved successfully at:', fileUri);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const togglePolyline = () => {
    setShowPolyline((prev) => !prev);
  };

  const handleConfirmPress = () => {
    setShowPolyline(true);
    Animated.timing(animatedHeight, {
      toValue: INITIAL_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowInputs(false);
    });
  };

  const handleLeftArrowPress = () => {
    setCurrentRouteIndex((prev) => (prev === 0 ? routes.length - 1 : prev - 1));
  };

  const handleRightArrowPress = () => {
    if (routeCur === 0) {
      setRouteCur(1);
    }
    if (routeCur === 1) {
        setRouteCur(2);
    } else if (routeCur === 2) {
        setRouteCur(3);
    } else if (routeCur === 3) {
        setRouteCur(1);
    }
    setCurrentRouteIndex((prev) => (prev === routes.length - 1 ? 0 : prev + 1));
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

        <Polyline
          coordinates={
            routeCur === 0 ? route_0 :    
            routeCur === 1 ? route_1 :
            routeCur === 2 ? route_2 :
            routeCur === 3 ? route_3 :
            []
          }
          strokeColor={    
            routeCur === 1 ? '#000000' :
            routeCur === 2 ? '#FFFFFF' :
            routeCur === 3 ? '#FF0000' :
            []
          }
          strokeWidth={4}    // Width of the polyline
        />
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
          <Text style={styles.routesText}>Routes: 3</Text>
          <View style={styles.iconGroup}>
            <TouchableOpacity style={styles.iconButton} onPress={handlePlusPress}>
              <AntDesign name={showInputs ? "minuscircle" : "pluscircle"} size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleWalkingPress}>
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

        {showRouteInputs && (
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

            <TouchableOpacity style={styles.iconBelowInputs} onPress={handleWalkingConfirmPress}>
              <Ionicons name="checkmark" size={40} color="white" />
            </TouchableOpacity>
          </View>
        )}


        {showPolylineInputs && (
          <View style={styles.inputContainer}>
            <View style={styles.routeSelection}>
              <TouchableOpacity onPress={handleLeftArrowPress}>
                <Text style={styles.arrowText}>&lt;</Text>
              </TouchableOpacity>
              <Text style={[styles.routeText, { color: 'white' }]}>Route {routeCur}</Text>
              <TouchableOpacity onPress={handleRightArrowPress}>
                <Text style={styles.arrowText}>&gt;</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.iconBelowInputs} onPress={handleConfirmStartEndNavPress}>
              <Ionicons name="checkmark" size={40} color="white" />
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
  routeSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  arrowText: {
    fontSize: 24,
    color: 'white',
    marginHorizontal: 20,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
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
