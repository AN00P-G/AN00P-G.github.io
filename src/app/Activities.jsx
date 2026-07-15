import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { useOS } from "./context.jsx";
import { APPS, LAUNCHER_APPS } from "./registry.js";

export default function Activities() {
  const { activitiesOpen, setActivitiesOpen, openApp } = useOS();
  const [query, setQuery] = useState("");
  const [host, setHost] = useState(null);

  useEffect(() => {
    setHost(document.getElementById("screen"));
  }, []);

  const apps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LAUNCHER_APPS.map((id) => APPS[id]).filter(
      (a) => a && (!q || a.label.toLowerCase().includes(q)),
    );
  }, [query]);

  useEffect(() => {
    if (!activitiesOpen) setQuery("");
  }, [activitiesOpen]);

  if (!activitiesOpen || !host) return null;

  return createPortal(
    <div className="activities-overlay is-open" aria-hidden="false">
      <div
        className="activities-backdrop"
        onClick={() => setActivitiesOpen(false)}
      />
      <div className="activities-panel">
        <input
          type="text"
          className="activities-search"
          placeholder="Search apps…"
          aria-label="Search applications"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="activities-grid">
          {apps.map((app) => {
            const { Icon } = app;
            return (
              <button
                key={app.id}
                type="button"
                className="act-app act-app--enter"
                onClick={() => openApp(app.id)}
              >
                <div
                  className="act-icon"
                  style={{ "--g1": app.g1, "--g2": app.g2 }}
                >
                  <Icon size={36} />
                  <div className="act-icon-shine" />
                </div>
                <span>{app.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    host,
  );
}
