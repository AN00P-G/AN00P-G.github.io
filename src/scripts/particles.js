/**
 * Lightweight particle network (ES module).
 * Adapted for portfolio desktop background.
 */

function Particle(net) {
  this.canvas = net.canvas;
  this.g = net.g;
  this.particleColor = net.options.particleColor;
  this.x = Math.random() * this.canvas.width;
  this.y = Math.random() * this.canvas.height;
  this.velocity = {
    x: (Math.random() - 0.5) * net.options.velocity,
    y: (Math.random() - 0.5) * net.options.velocity,
  };
}

Particle.prototype.update = function update() {
  if (this.x > this.canvas.width + 20 || this.x < -20) this.velocity.x = -this.velocity.x;
  if (this.y > this.canvas.height + 20 || this.y < -20) this.velocity.y = -this.velocity.y;
  this.x += this.velocity.x;
  this.y += this.velocity.y;
};

Particle.prototype.draw = function draw() {
  this.g.beginPath();
  this.g.fillStyle = this.particleColor;
  this.g.globalAlpha = 0.7;
  this.g.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
  this.g.fill();
};

function setStyles(el, styles) {
  Object.assign(el.style, styles);
}

function velocityFromSpeed(speed) {
  if (speed === "fast") return 1;
  if (speed === "slow") return 0.33;
  if (speed === "none") return 0;
  return 0.66;
}

function densityFromOption(density) {
  if (density === "high") return 5000;
  if (density === "low") return 20000;
  if (Number.isNaN(parseInt(density, 10))) return 10000;
  return density;
}

export class ParticleNetwork {
  constructor(container, options = {}) {
    this.container = container;
    this.size = { width: container.offsetWidth, height: container.offsetHeight };
    this.options = {
      particleColor: options.particleColor ?? "#6ef2b6",
      background: options.background ?? "#080c14",
      interactive: options.interactive ?? true,
      velocity: velocityFromSpeed(options.speed),
      density: densityFromOption(options.density),
    };
    this.raf = null;
    this.particles = [];
    this._running = false;
    this.init();
  }

  init() {
    this.bg = document.createElement("div");
    this.container.appendChild(this.bg);
    setStyles(this.bg, {
      position: "absolute",
      top: "0",
      left: "0",
      bottom: "0",
      right: "0",
      zIndex: "1",
      background: this.options.background,
    });

    this.canvas = document.createElement("canvas");
    this.container.appendChild(this.canvas);
    this.g = this.canvas.getContext("2d");
    this.canvas.width = this.size.width;
    this.canvas.height = this.size.height;
    setStyles(this.container, { position: "relative" });
    setStyles(this.canvas, { zIndex: "20", position: "relative" });

    this.onResize = () => {
      if (
        this.container.offsetWidth === this.size.width &&
        this.container.offsetHeight === this.size.height
      ) {
        return;
      }
      this.canvas.width = this.size.width = this.container.offsetWidth;
      this.canvas.height = this.size.height = this.container.offsetHeight;
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.spawn(), 400);
    };
    window.addEventListener("resize", this.onResize);

    this.spawn();
    this.start();
  }

  spawn() {
    this.particles = [];
    const count = (this.canvas.width * this.canvas.height) / this.options.density;
    for (let i = 0; i < count; i++) this.particles.push(new Particle(this));
    if (this.options.interactive) {
      this.mouse = new Particle(this);
      this.mouse.velocity = { x: 0, y: 0 };
      this.particles.push(this.mouse);
      this.canvas.onmousemove = (e) => {
        this.mouse.x = e.clientX - this.canvas.getBoundingClientRect().left;
        this.mouse.y = e.clientY - this.canvas.getBoundingClientRect().top;
      };
    }
  }

  update = () => {
    if (!this._running) return;
    this.g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.g.globalAlpha = 1;
    for (let a = 0; a < this.particles.length; a++) {
      this.particles[a].update();
      this.particles[a].draw();
      for (let b = this.particles.length - 1; b > a; b--) {
        const dist = Math.hypot(
          this.particles[a].x - this.particles[b].x,
          this.particles[a].y - this.particles[b].y,
        );
        if (dist > 120) continue;
        this.g.beginPath();
        this.g.strokeStyle = this.options.particleColor;
        this.g.globalAlpha = (120 - dist) / 120;
        this.g.lineWidth = 0.7;
        this.g.moveTo(this.particles[a].x, this.particles[a].y);
        this.g.lineTo(this.particles[b].x, this.particles[b].y);
        this.g.stroke();
      }
    }
    if (this.options.velocity !== 0) {
      this.raf = requestAnimationFrame(this.update);
    }
  };

  start() {
    if (this._running) return;
    this._running = true;
    this.raf = requestAnimationFrame(this.update);
  }

  stop() {
    this._running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this.onResize);
    this.canvas?.remove();
    this.bg?.remove();
  }
}

export function startParticles(element, options) {
  if (!element) return null;
  return new ParticleNetwork(element, options);
}
