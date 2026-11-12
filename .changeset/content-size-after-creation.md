---
"@panscale/core": patch
"@panscale/web": patch
"@panscale/react": patch
"@panscale/react-native": patch
---

Change the content size after creation. `Scaler` gets `setContentSize(width, height)`. The web adapter's resize handler now reads the size set by `updateContentSize`, so a resize no longer puts the scroll back inside the size given at creation. `useScaler` passes a changed `contentWidth` / `contentHeight` option to the live scaler, and the React Native `ScalerView` does the same when its `contentWidth` / `contentHeight` props change.
