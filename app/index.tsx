import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AudioCard from "./components/AudioCard";
import DeleteNoteModal from "./components/DeleteNoteModal";
import RecordButton from "./components/RecordButton";
import RenameNoteModal from "./components/RenameNoteModal";
import { AudioNote } from "./types/audioNote";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<AudioNote[]>([]);
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

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [renameNoteId, setRenameNoteId] = useState<string | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  const handleMenuPress = (noteId: string) => {
    setSelectedNoteId(noteId);
  };

  const handleRename = (id: string, newName: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, title: newName } : n));
    setRenameNoteId(null);
  };

  const handleDelete = async (id: string) => {
    // Optionally remove the file physically:
    // const note = notes.find(n => n.id === id);
    // if (note?.uri) await FileSystem.deleteAsync(note.uri, { idempotent: true });

    setNotes(notes.filter(n => n.id !== id));
    setDeleteNoteId(null);
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
          ListEmptyComponent={
            <Text style={styles.emptyText}>No recordings yet</Text>
          }
          ListHeaderComponent={
            notes.length > 0 ? <Text style={styles.sectionTitle}>Recent Recordings</Text> : null
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

        {/* Options Menu Modal */}
        <Modal
          visible={!!selectedNoteId}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedNoteId(null)}
        >
          <TouchableOpacity style={styles.menuOverlay} onPress={() => setSelectedNoteId(null)} activeOpacity={1}>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                setRenameNoteId(selectedNoteId);
                setSelectedNoteId(null);
              }}>
                <Ionicons name="pencil-outline" size={20} color="#fff" />
                <Text style={styles.menuItemText}>Rename</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                setDeleteNoteId(selectedNoteId);
                setSelectedNoteId(null);
              }}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Rename Modal */}
        <RenameNoteModal
          visible={!!renameNoteId}
          initialName={notes.find(n => n.id === renameNoteId)?.title || ""}
          onClose={() => setRenameNoteId(null)}
          onConfirm={(newName) => renameNoteId && handleRename(renameNoteId, newName)}
        />

        {/* Delete Modal */}
        <DeleteNoteModal
          visible={!!deleteNoteId}
          noteTitle={notes.find(n => n.id === deleteNoteId)?.title || ""}
          onClose={() => setDeleteNoteId(null)}
          onConfirm={() => deleteNoteId && handleDelete(deleteNoteId)}
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
  emptyText: {
    color: "#8A9BCC",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  list: {
    paddingBottom: 160,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#1E3C8A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});