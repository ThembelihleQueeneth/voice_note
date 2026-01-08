export interface AudioNote {
  id: string;
  title: string;
  duration: string;
  date: string;
  isPlaying: boolean;
}

export interface AudioCardProps {
  note: AudioNote;
  onTogglePlay: (id: string) => void;
  onMenuPress?: () => void;
}

export interface RecordButtonProps {
  onPress: () => void;
  isPulsing?: boolean;
  pulseAnim?: any; // You can use Animated.Value for better typing
}