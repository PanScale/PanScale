---
"@panscale/core": minor
"@panscale/web": minor
---

New opt-in `bounds` option: `{ kind: "keepVisible", minVisible }` lets the content move past the viewport edges while at least `minVisible` pixels stay in view. A wheel or pinch zoom stays anchored on the point under the cursor; a zoom out is never clamped, and a pan or zoom in that would hide the content stops with `minVisible` pixels left. The default, `{ kind: "contain" }`, is unchanged.
