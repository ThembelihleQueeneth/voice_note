import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AudioCardProps } from "../types/audioNote";

const AudioCard: React.FC<AudioCardProps> = ({ 
  note, 
  onTogglePlay, 
  onMenuPress 
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onTogglePlay(note.id)}
    >
      <View style={styles.cardLeft}>
        <TouchableOpacity
          style={[
            styles.playButton,
            note.isPlaying && styles.playButtonActive
          ]}
          onPress={() => onTogglePlay(note.id)}
        >
          <Ionicons
            name={note.isPlaying ? "pause" : "play"}
            size={16}
            color="#fff"
          />
        </TouchableOpacity>
        <View style={styles.waveform}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                note.isPlaying && styles.waveBarActive,
                { height: Math.random() * 20 + 8 }
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.cardMiddle}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {note.title}
        </Text>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color="#8A9BCC" />
            <Text style={styles.metaText}>{note.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color="#8A9BCC" />
            <Text style={styles.metaText}>{note.date}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.moreButton} 
        onPress={onMenuPress}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color="#8A9BCC" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  playButtonActive: {
    backgroundColor: "#FF3B30",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    height: 30,
  },
  waveBar: {
    width: 3,
    backgroundColor: "#4A90E2",
    marginHorizontal: 1.5,
    borderRadius: 3,
  },
  waveBarActive: {
    backgroundColor: "#FF3B30",
  },
  cardMiddle: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  metaInfo: {
    flexDirection: "row",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: "#8A9BCC",
    marginLeft: 4,
  },
  moreButton: {
    padding: 8,
  },
});

export default AudioCard;