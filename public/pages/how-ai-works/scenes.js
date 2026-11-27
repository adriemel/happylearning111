/*
 * Scene manifest: the art direction layer.
 * Swap or add environments here without touching the animation logic.
 *
 * Per scene:
 *   id      must match <section class="scene" data-scene="..."> in index.html
 *   beat    scroll length in vh (>= 160). The first 100 vh of a beat cross-fade
 *           in from the previous scene, the last 100 vh fly through to the next.
 *   accent  scene accent color (kicker, highlights, glow)
 *   layers  drawn back to front. depth: -1 = far background (barely moves),
 *           0 = mid ground, 1 = foreground (moves and zooms most).
 *           front: true puts the layer in front of the diagram (pointer-events off).
 *           fit: "cover" (default) | "bottom" | "top" anchors the image.
 *           opacity: optional 0..1 to tone a layer down.
 *   camera  optional slow dolly over the whole beat: { scale, x, y } end values
 *           applied to all layers (multiplied by their depth factor).
 */
window.AIX = window.AIX || {};
window.AIX.scenes = {
  palette: {
    bg: "#0c0b1c", card: "#12112a", border: "#272548", text: "#e4ddd4",
    lime: "#b5f23d", cyan: "#9ff3ff", blue: "#5b8cff", violet: "#c77dff",
    pink: "#ff6b9d", orange: "#ff8a2e", yellow: "#f5e642", green: "#5ddc95",
  },
  list: [
    {
      id: "intro", beat: 230, accent: "#b5f23d",
      camera: { scale: 0.12, y: -2 },
      layers: [
        { src: "assets/sky-night.svg", depth: -1 },
        { src: "assets/hills-far.svg", depth: -0.4, fit: "bottom" },
        { src: "assets/hills-near.svg", depth: 0.3, fit: "bottom" },
        { src: "assets/bokeh.svg", depth: 1, front: true },
      ],
    },
    {
      id: "harness", beat: 340, accent: "#b5f23d",
      camera: { scale: 0.08, x: -1 },
      layers: [
        { src: "assets/circuit-wall.svg", depth: -1 },
        { src: "assets/modules.svg", depth: -0.2 },
        { src: "assets/bokeh.svg", depth: 1, front: true },
      ],
    },
    {
      id: "tools", beat: 380, accent: "#ff8a2e",
      camera: { scale: 0.1, y: 1 },
      layers: [
        { src: "assets/sky-storm.svg", depth: -1 },
        { src: "assets/clouds-far.svg", depth: -0.4 },
        { src: "assets/clouds-near.svg", depth: 0.9, front: true },
      ],
    },
    {
      id: "llm", beat: 330, accent: "#c77dff",
      camera: { scale: 0.15 },
      layers: [
        { src: "assets/floor-grid.svg", depth: -0.6 },
        { src: "assets/bokeh-violet.svg", depth: 1, front: true },
      ],
    },
    {
      id: "tokens", beat: 330, accent: "#9ff3ff",
      camera: { scale: 0.08, x: 1 },
      layers: [
        { src: "assets/glyphs-far.svg", depth: -1 },
        { src: "assets/glyphs-near.svg", depth: 0.8, front: true },
      ],
    },
    {
      id: "embed", beat: 400, accent: "#5ddc95",
      camera: { scale: 0.1, y: -1 },
      layers: [
        { src: "assets/nebula.svg", depth: -1 },
        { src: "assets/number-rain.svg", depth: 0.2, opacity: 0.35 },
      ],
    },
    {
      id: "layers", beat: 420, accent: "#5b8cff",
      camera: { scale: 0.25 },
      layers: [
        { src: "assets/deep-glow.svg", depth: -0.8 },
      ],
    },
    {
      id: "attention", beat: 400, accent: "#ff6b9d",
      camera: { scale: 0.08, x: -1 },
      layers: [
        { src: "assets/constellation.svg", depth: -1 },
        { src: "assets/arcs-front.svg", depth: 0.9, front: true, opacity: 0.55 },
      ],
    },
    {
      id: "softmax", beat: 400, accent: "#f5e642",
      camera: { scale: 0.08 },
      layers: [
        { src: "assets/histo-back.svg", depth: -1 },
        { src: "assets/histo-far.svg", depth: -0.3, fit: "bottom" },
        { src: "assets/histo-near.svg", depth: 0.7, fit: "bottom", front: true },
      ],
    },
    {
      id: "loop", beat: 360, accent: "#b5f23d",
      camera: { scale: -0.1 },
      layers: [
        { src: "assets/sky-night.svg", depth: -1 },
        { src: "assets/hills-far.svg", depth: -0.4, fit: "bottom" },
        { src: "assets/hills-near.svg", depth: 0.3, fit: "bottom" },
      ],
    },
  ],
};
