import { TouchableOpacity, Text, type ViewStyle } from "react-native";

export interface ResetButtonProps {
  onReset: () => void;
  style?: ViewStyle;
  label?: string;
}

export function ResetButton({ onReset, style, label = "1:1" }: ResetButtonProps) {
  return (
    <TouchableOpacity onPress={onReset} style={style} accessibilityLabel="Reset zoom">
      <Text>{label}</Text>
    </TouchableOpacity>
  );
}
