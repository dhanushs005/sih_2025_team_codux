import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { io } from "socket.io-client";

const LOCATION_TASK_NAME = "BACKGROUND_LOCATION_TASK";
const SERVER_URL = "https://bus-tracker-server-ajmu.onrender.com";

interface LogEntry {
  busId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp: string;
}

const socket = io(SERVER_URL);
(globalThis as any).busIdForTracking = "";
(globalThis as any).addLogFromBackground = (log: LogEntry) => {};

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error("Location Task Error:", error);
    return;
  }
  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    if (location) {
      const { latitude, longitude, speed } = location.coords;
      const timestamp = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      const payload: LogEntry = {
        busId: (globalThis as any).busIdForTracking || "Unknown",
        latitude,
        longitude,
        speed: speed ?? 0, // Send speed, default to 0 if null
        timestamp,
      };

      socket.emit("updateLocation", payload);
      console.log("BG Location sent:", payload);

      // Add log locally too
      (globalThis as any).addLogFromBackground(payload);
    }
  }
});

export default function App() {
  const [busId, setBusId] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    socket.on("connect", () => console.log("Connected to server"));
    socket.on("disconnect", () => console.log("Disconnected"));

    (globalThis as any).addLogFromBackground = (log: LogEntry) => addLog(log);

    return () => {
      socket.disconnect();
    };
  }, []);

  const addLog = (log: LogEntry) => {
    setLogs((prev) => {
      const updated = [log, ...prev];
      return updated.slice(0, 20); // Keep only latest 20
    });
  };

  const startTracking = async () => {
    if (!busId.trim()) {
      Alert.alert("Enter Bus ID", "Please enter a bus ID before starting.");
      return;
    }

    (globalThis as any).busIdForTracking = busId;

    const { status: fgStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== "granted") {
      Alert.alert("Permission Denied", "Foreground location is required!");
      return;
    }

    const { status: bgStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== "granted") {
      Alert.alert("Permission Denied", "Background location is required!");
      return;
    }

    const hasStarted =
      await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (!hasStarted) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 2000,
        distanceInterval: 0,
        foregroundService: {
          notificationTitle: "Bus Tracking Active",
          notificationBody: "Your location is being tracked in background.",
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });
    }

    setTracking(true);
    Alert.alert("Tracking Started", "Now tracking even in background.");
  };

  const stopTracking = async () => {
    const hasStarted =
      await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
    setTracking(false);
    Alert.alert("Tracking Stopped");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Bus ID"
        value={busId}
        onChangeText={setBusId}
        editable={!tracking}
      />

      <Button
        title={tracking ? "Stop Tracking" : "Start Tracking"}
        onPress={tracking ? stopTracking : startTracking}
        color={tracking ? "red" : "#007bff"}
      />

      <ScrollView style={styles.logContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Bus ID</Text>
          <Text style={styles.headerCell}>Latitude</Text>
          <Text style={styles.headerCell}>Longitude</Text>
          <Text style={styles.headerCell}>Speed (km/h)</Text>
          <Text style={styles.headerCell}>Time</Text>
        </View>

        {logs.map((log, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              { backgroundColor: index % 2 === 0 ? "#fff" : "#f1f3f5" },
            ]}
          >
            <Text style={styles.cell}>{log.busId}</Text>
            <Text style={styles.cell}>{log.latitude.toFixed(5)}</Text>
            <Text style={styles.cell}>{log.longitude.toFixed(5)}</Text>
            <Text style={styles.cell}>
              {((log.speed ?? 0) * 3.6).toFixed(1)}
            </Text>
            <Text style={styles.cell}>{log.timestamp}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    paddingTop: 50,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#007bff",
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  logContainer: { flex: 1, marginTop: 10 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 6,
  },
  headerCell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 13,
    color: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  cell: { flex: 1, textAlign: "center", fontSize: 12, color: "#333" },
});
