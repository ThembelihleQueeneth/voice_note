import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RecordButtonProps } from "../types/audioNote";

const RecordButton: React.FC<RecordButtonProps> = ({ 
  onPress, 
  pulseAnim 
}) => {
  return (
    <View style={styles.recordWrapper}>
      {pulseAnim && (
        <Animated.View
          style={[
            styles.recordPulse,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [0.3, 0],
              }),
            },
          ]}
        />
      )}
      <TouchableOpacity
        style={styles.recordButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#FF3B30", "#FF6B6B"]}
          style={styles.recordGradient}
        >
          <Ionicons name="mic" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="folder-open" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="settings" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  recordWrapper: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  recordPulse: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FF3B30",
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActions: {
    flexDirection: "row",
    position: "absolute",
    top: -50,
    width: "60%",
    justifyContent: "space-between",
  },
  quickAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
});

export default RecordButton;