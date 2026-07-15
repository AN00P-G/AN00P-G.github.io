import {
  IconAbout,
  IconProjects,
  IconResume,
  IconCat,
  IconTerminal,
  IconImage,
  IconContact,
  IconExperiences,
  IconSkills,
} from "./icons.jsx";

/**
 * layout: fractions of the desktop pane (0–1) so windows spread out and stay in bounds.
 * designW/H: content canvas size — scaled to fill the window body on resize.
 * menuItems: app-specific actions (placeholders that can become real later).
 */
export const APPS = {
  about: {
    id: "about",
    title: "About",
    label: "About",
    g1: "#0d9488",
    g2: "#2dd4bf",
    Icon: IconAbout,
    defaultW: 0.46,
    defaultH: 0.52,
    designW: 560,
    designH: 380,
    layout: { x: 0.02, y: 0.03 },
    menuItems: ["Profile", "Share", "Help"],
  },
  image: {
    id: "image",
    title: "Image",
    label: "Image",
    g1: "#0284c7",
    g2: "#38bdf8",
    Icon: IconImage,
    defaultW: 0.30,
    defaultH: 0.55,
    designW: 340,
    designH: 420,
    layout: { x: 0.52, y: 0.03 },
    menuItems: ["Zoom", "Save", "Help"],
  },
  contact: {
    id: "contact",
    title: "Contact",
    label: "Contact",
    g1: "#059669",
    g2: "#34d399",
    Icon: IconContact,
    defaultW: 0.80,
    defaultH: 0.36,
    designW: 900,
    designH: 300,
    layout: { x: 0.02, y: 0.58 },
    menuItems: ["Github", "Compose", "Help"],
  },
  projects: {
    id: "projects",
    title: "Projects",
    label: "Projects",
    g1: "#10b981",
    g2: "#6ee7b7",
    Icon: IconProjects,
    defaultW: 0.62,
    defaultH: 0.62,
    designW: 760,
    designH: 520,
    layout: { x: 0.18, y: 0.08 },
    menuItems: ["Filter", "Open", "Help"],
  },
  experiences: {
    id: "experiences",
    title: "Experiences",
    label: "Experiences",
    g1: "#ea580c",
    g2: "#fb923c",
    Icon: IconExperiences,
    defaultW: 0.48,
    defaultH: 0.55,
    designW: 540,
    designH: 420,
    layout: { x: 0.06, y: 0.12 },
    menuItems: ["Timeline", "Export", "Help"],
  },
  skills: {
    id: "skills",
    title: "Skills",
    label: "Skills",
    g1: "#0ea5e9",
    g2: "#7dd3fc",
    Icon: IconSkills,
    defaultW: 0.44,
    defaultH: 0.42,
    designW: 500,
    designH: 340,
    layout: { x: 0.48, y: 0.28 },
    menuItems: ["Sort", "Copy", "Help"],
  },
  resume: {
    id: "resume",
    title: "Resume",
    label: "Resume",
    g1: "#0369a1",
    g2: "#38bdf8",
    Icon: IconResume,
    defaultW: 0.58,
    defaultH: 0.78,
    designW: 680,
    designH: 720,
    layout: { x: 0.20, y: 0.04 },
    menuItems: ["Print", "Download", "Help"],
  },
  cat: {
    id: "cat",
    title: "Cat",
    label: "Cat",
    g1: "#f43f5e",
    g2: "#fb923c",
    Icon: IconCat,
    defaultW: 0.72,
    defaultH: 0.70,
    designW: 900,
    designH: 560,
    layout: { x: 0.14, y: 0.06 },
    menuItems: ["Play", "Mute", "Help"],
  },
  terminal: {
    id: "terminal",
    title: "Terminal",
    label: "Terminal",
    g1: "#e95420",
    g2: "#f97316",
    Icon: IconTerminal,
    fullscreen: true,
  },
};

/** Dock favorites — no terminal */
export const FAVORITES = ["about", "image", "contact", "projects", "resume", "cat"];

export const LAUNCHER_APPS = [
  "about",
  "image",
  "contact",
  "projects",
  "experiences",
  "skills",
  "resume",
  "cat",
];

export const MOBILE_HOME_APPS = LAUNCHER_APPS;

export const BREAKPOINT = 900;

/** Fallback desktop size used during SSR / before measure */
export const FALLBACK_DESKTOP = { w: 1100, h: 680 };

/** Bottom margin reserved for auto-hide dock peek */
export const DOCK_MARGIN = 16;

export function getDesktopSize() {
  if (typeof document === "undefined") return { ...FALLBACK_DESKTOP };
  const el = document.querySelector(".desktop-layer");
  if (!el) return { ...FALLBACK_DESKTOP };
  const r = el.getBoundingClientRect();
  return {
    w: Math.max(320, r.width),
    h: Math.max(240, r.height - DOCK_MARGIN),
  };
}

/** Resolve registry fractions / px into a clamped window geometry */
export function resolveGeometry(appId, desktop = FALLBACK_DESKTOP) {
  const meta = APPS[appId];
  if (!meta || meta.fullscreen) return null;

  const dw = desktop.w;
  const dh = desktop.h;
  const frac = (v, axis) => (v > 0 && v <= 1 ? v * (axis === "w" ? dw : dh) : v);

  let w = Math.round(frac(meta.defaultW ?? 0.5, "w"));
  let h = Math.round(frac(meta.defaultH ?? 0.5, "h"));
  let x = Math.round(frac(meta.layout?.x ?? 0.05, "w"));
  let y = Math.round(frac(meta.layout?.y ?? 0.05, "h"));

  // Stay fully inside the desktop pane
  w = Math.min(w, dw - 8);
  h = Math.min(h, dh - 8);
  x = Math.min(Math.max(0, x), Math.max(0, dw - w));
  y = Math.min(Math.max(0, y), Math.max(0, dh - h));

  return { x, y, w, h };
}

export function clampWindow({ x, y, w, h }, desktop = getDesktopSize()) {
  const dw = desktop.w;
  const dh = desktop.h;
  const nw = Math.min(Math.max(280, w), dw);
  const nh = Math.min(Math.max(160, h), dh);
  const nx = Math.min(Math.max(0, x), Math.max(0, dw - nw));
  const ny = Math.min(Math.max(0, y), Math.max(0, dh - nh));
  return { x: nx, y: ny, w: nw, h: nh };
}
