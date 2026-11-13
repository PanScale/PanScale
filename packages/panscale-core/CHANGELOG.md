# @panscale/core

## 0.3.2

### Patch Changes

- [#8](https://github.com/PanScale/PanScale/pull/8) [`5760096`](https://github.com/PanScale/PanScale/commit/5760096d254d0c3343adc39ed864faab6e9ab3ae) Thanks [@byoklab](https://github.com/byoklab)! - Publish with the built `dist/` folder. 0.3.1 was published without it, so it cannot be used; this release has the same code as 0.3.1 and the package contents of 0.3.0.

## 0.3.1

### Patch Changes

- [#3](https://github.com/PanScale/PanScale/pull/3) [`cdd1aae`](https://github.com/PanScale/PanScale/commit/cdd1aae90b68f6e3e38050d4309b3449c736f39a) Thanks [@byoklab](https://github.com/byoklab)! - Change the content size after creation. `Scaler` gets `setContentSize(width, height)`. The web adapter's resize handler now reads the size set by `updateContentSize`, so a resize no longer puts the scroll back inside the size given at creation. `useScaler` passes a changed `contentWidth` / `contentHeight` option to the live scaler, and the React Native `ScalerView` does the same when its `contentWidth` / `contentHeight` props change.

- [#5](https://github.com/PanScale/PanScale/pull/5) [`eedf4d0`](https://github.com/PanScale/PanScale/commit/eedf4d05ff40816ee92c8243cc79438b33089cc0) Thanks [@byoklab](https://github.com/byoklab)! - Add the `repository` field to package.json so npm provenance can link each release to its source.
