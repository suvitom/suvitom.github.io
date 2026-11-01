const TILE = 55; // pattern size in pixels
const GAP = 50; // extra gap in grid units
const SIZE = TILE * ((100 + GAP) / 100);

// Pattern shapes on a 100 x 100 unit grid. An 8-unit margin is left at the edges
const RECTS = [
  // left upper L
  [8, 8, 45, 16],
  [8, 8, 19, 39],
  // right long vertical bar
  [73, 8, 19, 52],
  // left lower L
  [8, 62, 19, 30],
  [8, 76, 42, 16],
  // right bottom bar
  [64, 72, 28, 20],
  // figure's body
  [44, 41, 16, 26],
];
const HEAD = {cx: 52, cy: 35, r: 6};

function buildTile(color) {
  const rects = RECTS.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('');
  const head = `<circle cx="${HEAD.cx}" cy="${HEAD.cy}" r="${HEAD.r}"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `viewBox="${-GAP / 2} ${-GAP / 2} ${100 + GAP} ${100 + GAP}" ` +
    `width="${SIZE}" height="${SIZE}" fill="${color}">${rects}${head}</svg>`
  );
}

function applyBackground() {
  const side = document.querySelector('.side');
  if (!side) return;
  const svg = buildTile('rgb(208, 204, 215)');
  document.querySelectorAll('.side').forEach(side => {
    side.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    side.style.backgroundSize = `${SIZE}px ${SIZE}px`;
  });
}
