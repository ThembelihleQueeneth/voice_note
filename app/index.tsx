import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import AudioCard from "./components/AudioCard";
import RecordButton from "./components/RecordButton";
import { AudioNote } from "./types/audioNote";

const audioNotes: AudioNote[] = [
  { id: "1", title: "Morning Thoughts", duration: "01:24", date: "Today", isPlaying: false },
  { id: "2", title: "Meeting Notes", duration: "03:10", date: "Yesterday", isPlaying: true },
  { id: "3", title: "Daily Reflection", duration: "02:45", date: "Jan 12", isPlaying: false },
  { id: "4", title: "Ideas & Brainstorm", duration: "04:02", date: "Jan 10", isPlaying: false },
  { id: "5", title: "Project Planning", duration: "05:18", date: "Jan 8", isPlaying: false },
  { id: "6", title: "Creative Writing", duration: "02:30", date: "Jan 5", isPlaying: false },
];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<AudioNote[]>(audioNotes);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const togglePlay = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, isPlaying: !note.isPlaying }
        : { ...note, isPlaying: false }
    ));
  };

  const handleMenuPress = (noteId: string) => {
    // Handle menu actions here
    console.log("Menu pressed for note:", noteId);
    // You can show a modal or action sheet
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.safeArea}>
      <LinearGradient
        colors={["#0A2463", "#1E3C8A", "#3E5FC9"]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Be patient with yourself</Text>
            <Text style={styles.title}>Voice Notes</Text>
          </View>
          
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{notes.length}</Text>
            <Text style={styles.statLabel}>Recordings</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8A9BCC" />
          <TextInput
            placeholder="Search recordings..."
            placeholderTextColor="#8A9BCC"
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#8A9BCC" />
            </TouchableOpacity>
          )}
        </View>

        {/* Audio Cards */}
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Recent Recordings</Text>
          }
          renderItem={({ item }) => (
            <AudioCard
              note={item}
              onTogglePlay={togglePlay}
              onMenuPress={() => handleMenuPress(item.id)}
            />
          )}
        />

        {/* Record Button with Animation */}
        <RecordButton
          onPress={startPulse}
          pulseAnim={pulseAnim}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A2463",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  greeting: {
    fontSize: 16,
    color: "#8A9BCC",
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8A9BCC",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  input: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
    marginTop: 8,
  },
  list: {
    paddingBottom: 160,
  },
});