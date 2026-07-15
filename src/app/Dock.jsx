import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useOS } from "./context.jsx";
import { APPS, FAVORITES } from "./registry.js";
import { IconApps } from "./icons.jsx";

function DockIcon({ appId, active, minimized, onClick }) {
  const meta = APPS[appId];
  if (!meta) return null;
  const { Icon } = meta;

  return (
    <button
      type="button"
      className={`dock-pin${active ? " dock-pin--active" : ""}${minimized ? " dock-pin--min" : ""}`}
      onClick={onClick}
      aria-label={meta.label}
    >
      <span className="dock-icon-wrap" style={{ "--g1": meta.g1, "--g2": meta.g2 }}>
        <Icon size={18} />
      </span>
      <span className="dock-tooltip">{meta.label}</span>
    </button>
  );
}

function DockInner() {
  const {
    windows,
    openApp,
    restoreWindow,
    minimizeWindow,
    setActivitiesOpen,
  } = useOS();

  const handleFav = (appId) => {
    const existing = windows.find((w) => w.appId === appId);
    if (!existing) {
      openApp(appId);
      return;
    }
    if (existing.minimized) restoreWindow(existing.id);
    else minimizeWindow(existing.id);
  };

  return (
    <div className="dock-inner">
      <div className="dock-pinned">
        {FAVORITES.map((id) => {
          const win = windows.find((w) => w.appId === id);
          const active = Boolean(win && !win.minimized);
          const minimized = Boolean(win?.minimized);
          return (
            <DockIcon
              key={id}
              appId={id}
              active={active}
              minimized={minimized}
              onClick={() => handleFav(id)}
            />
          );
        })}
      </div>
      <div className="dock-sep" aria-hidden="true" />
      <button
        type="button"
        className="dock-pin"
        aria-label="All applications"
        onClick={() => setActivitiesOpen(true)}
      >
        <span className="dock-icon-wrap" style={{ "--g1": "#334155", "--g2": "#64748b" }}>
          <IconApps size={18} />
        </span>
        <span className="dock-tooltip">All Apps</span>
      </button>
    </div>
  );
}

export default function Dock() {
  const [host, setHost] = useState(null);

  useEffect(() => {
    setHost(document.getElementById("taskbar"));
  }, []);

  // Auto-reveal dock when pointer nears the bottom of #screen
  useEffect(() => {
    const screen = document.getElementById("screen");
    const taskbar = document.getElementById("taskbar");
    const hotzone = document.getElementById("dock-hotzone");
    if (!screen || !taskbar) return undefined;

    let hideTimer = null;
    const reveal = (show) => {
      clearTimeout(hideTimer);
      if (show) {
        taskbar.classList.add("is-revealed");
      } else {
        hideTimer = setTimeout(() => {
          if (!taskbar.matches(":hover") && !(hotzone && hotzone.matches(":hover"))) {
            taskbar.classList.remove("is-revealed");
          }
        }, 350);
      }
    };

    const onMove = (e) => {
      const rect = screen.getBoundingClientRect();
      const dist = rect.bottom - e.clientY;
      reveal(dist < 56);
    };

    const onLeave = () => reveal(false);

    screen.addEventListener("mousemove", onMove);
    screen.addEventListener("mouseleave", onLeave);
    taskbar.addEventListener("mouseenter", () => reveal(true));
    taskbar.addEventListener("mouseleave", () => reveal(false));
    hotzone?.addEventListener("mouseenter", () => reveal(true));
    hotzone?.addEventListener("mouseleave", () => reveal(false));

    return () => {
      clearTimeout(hideTimer);
      screen.removeEventListener("mousemove", onMove);
      screen.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!host) return null;
  return createPortal(<DockInner />, host);
}
