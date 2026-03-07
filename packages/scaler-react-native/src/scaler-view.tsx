import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, View, type ViewStyle, type LayoutChangeEvent } from "react-native";
import { Scaler, type ScalerOptions, type ScalerValues } from "@scaler/core";
import { createNativeAdapter } from "./native-adapter";

export interface NativeScalerViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  contentWidth: number;
  contentHeight: number;
  options?: Partial<ScalerOptions>;
  onValuesChange?: (values: ScalerValues) => void;
}

export function ScalerView({
  children,
  style,
  contentWidth,
  contentHeight,
  options,
  onValuesChange
}: NativeScalerViewProps) {
  const transformRef = useRef(new Animated.ValueXY({ x: 0, y: 0 }));
  const scaleRef = useRef(new Animated.Value(1));
  const scalerRef = useRef<Scaler | null>(null);

  const callback = useCallback((values: ScalerValues) => {
    transformRef.current.setValue({ x: values.translateX, y: values.translateY });
    scaleRef.current.setValue(values.zoom);
    onValuesChange?.(values);
  }, [onValuesChange]);

  if (!scalerRef.current) {
    scalerRef.current = new Scaler(callback, { zooming: true, ...options });
  }

  const panResponder = useRef(createNativeAdapter(scalerRef.current));

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    scalerRef.current?.setDimensions(width, height, contentWidth, contentHeight);
  }, [contentWidth, contentHeight]);

  useEffect(() => {
    return () => {
      scalerRef.current?.destroy();
    };
  }, []);

  const animatedStyle = {
    transform: [
      { translateX: transformRef.current.x },
      { translateY: transformRef.current.y },
      { scale: scaleRef.current }
    ]
  };

  return (
    <View style={[{ overflow: "hidden" }, style]} onLayout={onLayout} {...panResponder.current.panHandlers}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </View>
  );
}
