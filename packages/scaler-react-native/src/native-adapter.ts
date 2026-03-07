import { useRef, useMemo } from "react";
import { PanResponder, type GestureResponderEvent, type PanResponderGestureState } from "react-native";
import { Scaler, type ScalerOptions, type ScalerTouch } from "@scaler/core";

function nativeTouchesToScaler(event: GestureResponderEvent): ScalerTouch[] {
  const touches = event.nativeEvent.touches;
  if (!touches || touches.length === 0) {
    return [{ pageX: event.nativeEvent.pageX, pageY: event.nativeEvent.pageY }];
  }
  return Array.from(touches).map((t) => ({
    pageX: t.pageX,
    pageY: t.pageY
  }));
}

export function createNativeAdapter(scaler: Scaler) {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      scaler.doTouchStart(nativeTouchesToScaler(e), e.nativeEvent.timestamp);
    },
    onPanResponderMove: (e) => {
      scaler.doTouchMove(nativeTouchesToScaler(e), e.nativeEvent.timestamp);
    },
    onPanResponderRelease: (e) => {
      scaler.doTouchEnd(e.nativeEvent.timestamp);
    },
    onPanResponderTerminate: (e) => {
      scaler.doTouchEnd(e.nativeEvent.timestamp);
    }
  });

  return panResponder;
}
