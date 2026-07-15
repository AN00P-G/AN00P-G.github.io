import { useOS } from "./context.jsx";
import { APPS, MOBILE_HOME_APPS } from "./registry.js";

export default function MobileHome() {
  const { openApp, openRecents } = useOS();

  return (
    <div className="android-home">
      <div className="android-home-grid">
        {MOBILE_HOME_APPS.map((id) => {
          const app = APPS[id];
          const { Icon } = app;
          return (
            <button
              key={id}
              type="button"
              className="android-app-icon"
              onClick={() => openApp(id)}
            >
              <span
                className="android-app-bubble"
                style={{ "--g1": app.g1, "--g2": app.g2 }}
              >
                <Icon size={28} />
              </span>
              <span className="android-app-label">{app.label}</span>
            </button>
          );
        })}
      </div>

      <nav className="android-nav-bar" aria-label="Android navigation">
        <button type="button" className="android-nav-btn" onClick={openRecents} aria-label="Recents">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="5" width="10" height="14" rx="1.5" />
            <rect x="10" y="5" width="10" height="14" rx="1.5" />
          </svg>
        </button>
        <button type="button" className="android-nav-btn android-nav-home" aria-label="Home" disabled>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <circle cx="12" cy="12" r="8" />
          </svg>
        </button>
        <button type="button" className="android-nav-btn" aria-label="Back" disabled>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
