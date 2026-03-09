import { View, Text, TouchableOpacity, type ViewStyle } from "react-native";

export interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  style?: ViewStyle;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, style }: ZoomControlsProps) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]}>
      <TouchableOpacity onPress={onZoomOut} accessibilityLabel="Zoom out">
        <Text style={{ fontSize: 20 }}>−</Text>
      </TouchableOpacity>
      <Text>{Math.round(zoom * 100)}%</Text>
      <TouchableOpacity onPress={onZoomIn} accessibilityLabel="Zoom in">
        <Text style={{ fontSize: 20 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
