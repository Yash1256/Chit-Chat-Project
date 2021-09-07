const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

// Constants
const DENSITY = 200;
const VELOCITY = 0.5;
const MAX_DISTANCE = 100;
const MAX_CONNECTIONS = 10;

const light = new window.illuminated.Lamp({
  position: new window.illuminated.Vec2(0, 0),
  distance: (document.body.offsetWidth + document.body.offsetHeight) / 2,
  diffuse: 1,
  color: "rgba(120,100,200,0.2)",
  radius: 5,
  samples: 0,
});

const mask = new window.illuminated.DarkMask({
  lights: [light],
  color: "rgba(0,0,0,0.75)",
});

// Capture mouse movement
let mouseX = 0,
  mouseY = 0;
canvas.addEventListener("mousemove", (e) => {
  mouseX = e.x;
  mouseY = e.y;
  light.position = new window.illuminated.Vec2(mouseX, mouseY);
});

// Clamp n between min and max
function clamp(n, min, max) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

const startingPoints = new Array(DENSITY)
  .fill(null)
  .map((_) => [
    // x
    Math.random() * document.body.offsetWidth,
    // y
    Math.random() * document.body.offsetHeight,
    // direction x
    Math.random() < 0.5 ? -1 : 1,
    // direction y
    Math.random() < 0.5 ? -1 : 1,
    // color r
    clamp(Math.random() + 0.2, 0.2, 0.6),
    // color g
    clamp(Math.random() + 0.2, 0.2, 0.6),
    // color b
    clamp(Math.random() + 0.2, 0.2, 0.6),
  ])
  .map(([x, y, dx, dy, cr, cg, cb]) => [~~x, ~~y, dx, dy, cr, cg, cb]);

const lighting = new window.illuminated.Lighting({ light, objects: [] });

let connectBlacklist = [];

function update() {
  // Reset blacklist
  connectBlacklist = [];

  // Iterate over nodes
  for (const p of startingPoints) {
    let [oldx, oldy] = p;

    // Update position
    p[0] += Math.random() * VELOCITY * p[2];
    p[1] += Math.random() * VELOCITY * p[3];

    // Destructure node
    let [x, y] = p;

    // Boundary check X
    if (x < 0 || x > document.body.offsetWidth) {
      p[2] *= -1;
    }

    // Boundary check Y
    if (y < 0 || y > document.body.offsetHeight) {
      p[3] *= -1;
    }

    // Mouse collision
    const dist = 50;
    if (
      (Math.abs(mouseX - x) < dist || Math.abs(x - mouseX) < dist) &&
      (Math.abs(mouseY - y) < dist || Math.abs(y - mouseY) < dist)
    ) {
      p[0] += VELOCITY * p[2] * 10;
      p[1] += VELOCITY * p[3] * 10;
    }
  }
}

function drawPoint([x, y]) {
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
  ctx.fillStyle = "white";
  ctx.fill();
}

function connectPoint(thisp, dist) {
  let n = 0;
  let strength = 0;
  const [x, y, dx, dy, cr, cg, cb] = thisp;
  connectBlacklist.push(thisp);

  // Iterate over points
  for (const p of startingPoints) {
    // Destructure node
    const [px, py] = p;

    // Validate move
    if (n > MAX_CONNECTIONS) return;
    if (connectBlacklist.includes(p)) continue;

    // Validate distance
    if (Math.abs(x - px) < dist && Math.abs(y - py) < dist) {
      // Calculate connection strength
      strength += (Math.abs(x - px) + Math.abs(y - py)) / 2;
      let avg = clamp(strength / (n + 1), 0, MAX_DISTANCE * 2);
      let fac = (avg / MAX_DISTANCE) * 255;

      // Calculate color from connection strength
      let r = clamp(fac * cr, 0, 125);
      let g = clamp(fac * cg, 0, 125);
      let b = clamp(fac * cb, 0, 125);
      let a = clamp(avg / (MAX_DISTANCE * 0.75), 0.3, 0.9);
      let color = `rgba(${r},${r},${g},${a})`;

      // Draw line
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(px, py);
      ctx.strokeStyle = color;
      ctx.stroke();

      // Increment node count
      n += 1;

      // Add node to blacklist
      connectBlacklist.push(p);
    }
  }
}

function draw() {
  ctx.fillStyle = "rgb(20,20,25)";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const p of startingPoints) {
    drawPoint(p);
    connectPoint(
      [mouseX, mouseY],
      MAX_DISTANCE * 1.5,
      Math.random(),
      Math.random(),
      Math.random()
    );
    connectPoint(p, MAX_DISTANCE);
  }
  // light.render(ctx);
  lighting.compute(canvas.width, canvas.height);
  lighting.render(ctx);
  mask.compute(canvas.width, canvas.height);
  mask.render(ctx);
}

function loop() {
  update();
  draw();
  window.requestAnimationFrame(loop);
}

loop();
