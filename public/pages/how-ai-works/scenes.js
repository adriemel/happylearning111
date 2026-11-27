/*
 * World manifest: the art direction layer. Change environments, stations and
 * decoration here without touching the animation logic (engine.js).
 *
 * The page is one continuous flight forward along the z axis.
 *
 * envs      named environments (backdrops). Every image is in assets/.
 *   sky       full backdrop above the horizon
 *   sun       object sitting on the horizon at the vanishing point (optional)
 *   horizon   silhouette standing on the horizon line (optional)
 *   floor     grid tile for the moving floor; ceiling: same for a ceiling (optional)
 *   floorBg   color under the floor grid
 *   deco      images flying past on the sides (2.5D foreground)
 *   decoMode  "ground" (stand on the floor) or "float" (anywhere at the sides)
 *
 * stations  in flight order. id must match <section data-station="..."> in index.html.
 *   env       which environment surrounds the station
 *   dwell     scroll length (in vh) the camera stays at the station while its story plays
 *   accent    station accent color
 *   passFade  [start, end] distance behind the camera (world units) over which the
 *             station fades while flying past; bigger = it stays visible longer (portal)
 *
 * flight    fly: scroll length (vh) between stations; gap: distance between stations
 *           (world units); perspective: focal length (world units)
 */
window.AIX = window.AIX || {};
window.AIX.scenes = {
  flight: { fly: 120, gap: 1800, perspective: 900 },
  envs: {
    outside: {
      sky: "assets/synth-sky.svg", sun: "assets/synth-sun.svg", horizon: "assets/synth-mountains.svg",
      floor: "assets/grid-magenta.svg", floorBg: "#0b0420",
      deco: ["assets/deco-pyramid.svg", "assets/deco-iceberg.svg"], decoMode: "ground",
    },
    inside: {
      sky: "assets/inside-void.svg", sun: "assets/inside-core.svg",
      floor: "assets/grid-cyan.svg", ceiling: "assets/grid-violet.svg", floorBg: "#05031a",
      deco: ["assets/deco-cube.svg", "assets/deco-digits.svg", "assets/deco-ring.svg"], decoMode: "float",
    },
  },
  stations: [
    { id: "intro", env: "outside", dwell: 190, accent: "#ff3fa4" },
    { id: "llm", env: "outside", dwell: 170, accent: "#b46bff", passFade: [-700, -840] },
    { id: "tokens", env: "inside", dwell: 260, accent: "#5ff4ff" },
    { id: "embed", env: "inside", dwell: 320, accent: "#5ddc95" },
    { id: "space", env: "inside", dwell: 300, accent: "#5ddc95" },
    { id: "attention", env: "inside", dwell: 320, accent: "#ff6b9d" },
    { id: "layers", env: "inside", dwell: 300, accent: "#5b8cff" },
    { id: "softmax", env: "inside", dwell: 330, accent: "#ffd23f" },
    { id: "loop", env: "inside", dwell: 340, accent: "#ff3fa4" },
    { id: "outro", env: "outside", dwell: 170, accent: "#b5f23d" },
  ],
  decoCount: 46,
};
