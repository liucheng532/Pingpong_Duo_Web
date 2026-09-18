# PingPongDuo — System overview in motion

An animated website based on **slide 1 of Overview_fig.pptx**. The source composition and original experimental illustrations are preserved.

## Open

Serve this directory with a local static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. No npm install, build step or external CDN is required for the overview page. AVIF support is required for the original figure plate.

## Interaction

**Arrows:** travelling signals follow all 12 authored SVG paths, including the complete robot-action feedback route. The selected skill branch is emphasised.

**Strike / Clear:** strike has a ball passage, contact pulse and seven-joint arm highlight; clearance has outward chevrons and an expanding ground halo. The original image remains a fixed A-Strike / B-Clear snapshot, not a fabricated rollout.

**Task phases:** a short visual reference scan settles on the chosen reference. The wheel, reference box, skill outline, signal emphasis and selector readout stay in sync. Click any phase to hold it; Play resumes the sequence. Space pauses all motion, Left/Right steps phases, R restarts. Playback speeds are 0.5×, 1×, 1.5× and 2×. Overview, Deployment and Training tabs change the inspected region.

## Archify

The **Explore Archify map** link opens the separately generated deployment relationship map. `source/deployment.dataflow.json` is its typed source; the GitHub Actions workflow invokes the real pinned Archify renderer and writes validation/delivery receipts. The slide-preserving overview uses custom SVG/JavaScript for effects outside Archify's stock node-and-edge viewer.

## Files

- `index.html`: complete inline SVG figure and accessible page controls.
- `assets/site.css`: layout, appearance and static/reduced-motion styles.
- `assets/site.js`: one-clock playback, signal motion and phase matching.
- `assets/plate.avif`: original source artwork, with animated elements removed.
- `assets/overview.svg`: editable overlay source in slide coordinates.
- `source/animation.json`: authored path coordinates and presentation metadata.
- `source/NOTES.md`: provenance, interpretation limits and verification scope.
- `verification/browser.json`: local browser test results.
- `archify/`: genuine Archify output and deterministic build receipts.

The uploaded package did not include the referenced paper/LaTeX folder. Phase ordering and timing are an explanatory animation and must not be presented as experimental data. See `source/NOTES.md`.
