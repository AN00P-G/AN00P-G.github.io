import { useRef } from "react";
import { useOS } from "./context.jsx";
import { APPS } from "./registry.js";
import AboutApp from "./apps/AboutApp.jsx";
import ImageApp from "./apps/ImageApp.jsx";
import ContactApp from "./apps/ContactApp.jsx";
import ProjectsApp from "./apps/ProjectsApp.jsx";
import ExperiencesApp from "./apps/ExperiencesApp.jsx";
import SkillsApp from "./apps/SkillsApp.jsx";
import ResumeApp from "./apps/ResumeApp.jsx";
import CatApp from "./apps/CatApp.jsx";

export const CONTENT = {
  about: AboutApp,
  image: ImageApp,
  contact: ContactApp,
  projects: ProjectsApp,
  experiences: ExperiencesApp,
  skills: SkillsApp,
  resume: ResumeApp,
  cat: CatApp,
};

export default function Window({ win }) {
  const {
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    closeWindow,
    updateWindow,
  } = useOS();
  const winRef = useRef(null);
  const meta = APPS[win.appId];
  const Content = CONTENT[win.appId];

  if (!meta || !Content) return null;
  if (win.minimized) return null;

  const bringToFront = () => focusWindow(win.id);

  const startDrag = (e) => {
    if (win.maximized || e.button !== 0) return;
    if (e.target.closest(".lw-wm-buttons, .lw-resize")) return;
    e.preventDefault();
    bringToFront();

    const startX = e.clientX;
    const startY = e.clientY;
    const ox = win.x;
    const oy = win.y;
    const ow = win.w;
    const oh = win.h;
    const el = winRef.current;
    el?.classList.add("lw-dragging");

    const onMove = (ev) => {
      updateWindow(win.id, {
        x: ox + (ev.clientX - startX),
        y: oy + (ev.clientY - startY),
        w: ow,
        h: oh,
      });
    };
    const onUp = () => {
      el?.classList.remove("lw-dragging");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startResize = (dir) => (e) => {
    if (win.maximized || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    bringToFront();

    const startX = e.clientX;
    const startY = e.clientY;
    const { x: ox, y: oy, w: ow, h: oh } = win;
    const el = winRef.current;
    el?.classList.add("lw-resizing");

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let nw = ow;
      let nh = oh;
      let nx = ox;
      let ny = oy;
      if (dir.includes("e")) nw = ow + dx;
      if (dir.includes("s")) nh = oh + dy;
      if (dir.includes("w")) {
        nw = ow - dx;
        nx = ox + (ow - nw);
      }
      if (dir.includes("n")) {
        nh = oh - dy;
        ny = oy + (oh - nh);
      }
      updateWindow(win.id, { w: nw, h: nh, x: nx, y: ny });
    };
    const onUp = () => {
      el?.classList.remove("lw-resizing");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const style = win.maximized
    ? { zIndex: win.z }
    : {
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: win.z,
      };

  return (
    <div
      ref={winRef}
      className={`lw-container${win.maximized ? " lw-maximized" : ""}`}
      style={style}
      onPointerDownCapture={bringToFront}
    >
      <div className="lw-titlebar" onMouseDown={startDrag}>
        <span className="lw-title">{meta.title}</span>
        <div className="lw-wm-buttons">
          <button
            type="button"
            className="lw-btn lw-min"
            title="Minimize"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => minimizeWindow(win.id)}
          >
            −
          </button>
          <button
            type="button"
            className="lw-btn lw-max"
            title={win.maximized ? "Restore" : "Maximize"}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => toggleMaximize(win.id)}
          >
            {win.maximized ? "⊡" : "□"}
          </button>
          <button
            type="button"
            className="lw-btn lw-close"
            title="Close"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => closeWindow(win.id)}
          >
            ×
          </button>
        </div>
      </div>

      {meta.menuItems?.length > 0 && (
        <div className="lw-menubar">
          {meta.menuItems.map((m) => (
            <span key={m} className="lw-menu-item">
              {m}
            </span>
          ))}
        </div>
      )}

      <div className="lw-body">
        <Content />
      </div>

      {!win.maximized && (
        <>
          <div className="lw-resize lw-resize-n" onMouseDown={startResize("n")} />
          <div className="lw-resize lw-resize-s" onMouseDown={startResize("s")} />
          <div className="lw-resize lw-resize-e" onMouseDown={startResize("e")} />
          <div className="lw-resize lw-resize-w" onMouseDown={startResize("w")} />
          <div className="lw-resize lw-resize-ne" onMouseDown={startResize("ne")} />
          <div className="lw-resize lw-resize-nw" onMouseDown={startResize("nw")} />
          <div className="lw-resize lw-resize-se" onMouseDown={startResize("se")} />
          <div className="lw-resize lw-resize-sw" onMouseDown={startResize("sw")} />
        </>
      )}
    </div>
  );
}
