import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const startRecording = async () => {
    if (isProcessingAudio) return;
    setIsProcessingAudio(true);
    try {
      if (permissionResponse?.status !== 'granted') {
        const response = await requestPermission();
        if (response.status !== 'granted') return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);

      pulseAnim.setValue(1);
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
    } catch (err) {
      console.error('Failed to start recording', err);
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const stopRecording = async () => {
    if (!recording || isProcessingAudio) return;
    setIsProcessingAudio(true);

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setRecording(null);

      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      const uri = recording.getURI();
      if (uri) {
        const newNote: AudioNote = {
          id: Date.now().toString(),
          title: `Recording ${notes.length + 1}`,
          duration: "00:00",
          date: "Just now",
          isPlaying: false,
          uri: uri,
        };
        setNotes([newNote, ...notes]);
      }
    } catch (err) {
      console.error('Failed to stop recording cleanly', err);
      // Clean up the UI state even if the stopping failed natively.
      setRecording(null);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleRecordPress = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const togglePlay = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    if (note.isPlaying) {
      setNotes(notes.map(n => ({ ...n, isPlaying: false })));
      return;
    }

    if (note.uri) {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: note.uri },
          { shouldPlay: true }
        );
        setSound(newSound);

        setNotes(notes.map(n =>
          n.id === id ? { ...n, isPlaying: true } : { ...n, isPlaying: false }
        ));

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setNotes(prevNotes => prevNotes.map(n =>
              n.id === id ? { ...n, isPlaying: false } : n
            ));
          }
        });
      } catch (error) {
        console.error("Error playing sound", error);
      }
    } else {
      setNotes(notes.map(n =>
        n.id === id ? { ...n, isPlaying: true } : { ...n, isPlaying: false }
      ));
    }
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
          onPress={handleRecordPress}
          isRecording={!!recording}
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