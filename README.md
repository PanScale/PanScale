# Panscale

Pan, zoom, and scroll for any JS runtime. Physics-based momentum and bounce.

**[Docs](https://panscale.yatsyk.com/docs)** &middot; **[Playground](https://panscale.yatsyk.com/playground)** &middot; **[GitHub](https://github.com/PanScale/PanScale)**

## Packages

| Package | Description |
|---------|-------------|
| [`@panscale/core`](https://www.npmjs.com/package/@panscale/core) | Runtime-agnostic engine — momentum, bounce, snap, constraints |
| [`@panscale/web`](https://www.npmjs.com/package/@panscale/web) | DOM adapter — mouse, touch, wheel, pointer events |
| [`@panscale/react`](https://www.npmjs.com/package/@panscale/react) | React hooks and components |
| [`@panscale/react-native`](https://www.npmjs.com/package/@panscale/react-native) | React Native adapter with Animated transforms |

## Quick start

```bash
npm install @panscale/core @panscale/web
```

```typescript
import { createWebScaler } from "@panscale/web";

const scaler = createWebScaler(element, {
  contentWidth: 1600,
  contentHeight: 900,
  zooming: true,
  bouncing: true,
  callback: (values) => {
    content.style.transform =
      `matrix(${values.zoom},0,0,${values.zoom},${values.translateX},${values.translateY})`;
  },
});
```

## License

[MIT](LICENSE)
