# Panscale

Pan/zoom/scroll transformation library for any JS runtime.

## Structure

- `packages/panscale-core` — Runtime-agnostic engine (`@panscale/core`)
- `packages/panscale-web` — DOM event adapter (`@panscale/web`)
- `packages/panscale-react` — React hooks/components (`@panscale/react`)
- `packages/panscale-react-native` — React Native adapter (`@panscale/react-native`)
- `packages/panscale-config` — Shared config (`@panscale/config`)
- `apps/panscale-site` — Docs + playground (Next.js, port 7780)

## Commands

```bash
pnpm install          # install deps
pnpm build            # build all packages
pnpm dev              # dev all (parallel)
pnpm --filter panscale-site dev   # dev site only
```

## Deployment

- **Prod**: `panscale.yatsyk.com` (Vercel, token: `$VERCEL_YATSYK_TOKEN`)
- **NPM**: `$NPM_TOKEN` env var for publishing

## Notes

- API names (`Scaler`, `createWebScaler`, `useScaler`, `ScalerView`, `ScalerValues`) are intentional — don't rename
- Package manager: pnpm 10
- Node: >=20
