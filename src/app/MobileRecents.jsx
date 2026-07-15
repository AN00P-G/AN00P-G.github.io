import { useOS } from "./context.jsx";
import { APPS } from "./registry.js";
import { CONTENT } from "./Window.jsx";

export function MobileAppView() {
  const { mobileActive, goHome, openRecents, closeApp } = useOS();
  if (!mobileActive || mobileActive === "terminal") return null;

  const meta = APPS[mobileActive];
  const Content = CONTENT[mobileActive];
  if (!meta || !Content) return null;

  return (
    <div className="android-app-screen">
      <header className="android-app-bar">
        <button type="button" className="android-back" onClick={goHome} aria-label="Back">
          ‹
        </button>
        <span className="android-app-bar-title">{meta.title}</span>
        <button type="button" className="android-close-app" onClick={() => closeApp(mobileActive)} aria-label="Close">
          ×
        </button>
      </header>
      <div className="android-app-body">
        <Content />
      </div>
      <nav className="android-nav-bar" aria-label="Android navigation">
        <button type="button" className="android-nav-btn" onClick={openRecents} aria-label="Recents">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="5" width="10" height="14" rx="1.5" />
            <rect x="10" y="5" width="10" height="14" rx="1.5" />
          </svg>
        </button>
        <button type="button" className="android-nav-btn" onClick={goHome} aria-label="Home">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <circle cx="12" cy="12" r="8" />
          </svg>
        </button>
        <button type="button" className="android-nav-btn" onClick={goHome} aria-label="Back">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </nav>
    </div>
  );
}

export default function MobileRecents() {
  const {
    windows,
    closeWindow,
    setMobileView,
    setMobileActive,
    goHome,
  } = useOS();

  const openCards = windows.filter((w) => w.appId !== "terminal");

  const closeAll = () => {
    openCards.forEach((w) => closeWindow(w.id));
    goHome();
  };

  return (
    <div className="app-manager is-open" role="dialog" aria-label="Recent apps">
      <div className="app-manager-inner">
        <div className="app-manager-header">
          <span className="app-manager-title">Recent Apps</span>
          <button type="button" className="app-manager-close-all" onClick={closeAll}>
            Close all
          </button>
        </div>
        <div className="app-manager-cards">
          {openCards.length === 0 ? (
            <p className="app-manager-empty">No open apps</p>
          ) : (
            openCards.map((w) => {
              const meta = APPS[w.appId];
              if (!meta) return null;
              const { Icon } = meta;
              return (
                <div key={w.id} className="app-mgr-card">
                  <button
                    type="button"
                    className="app-mgr-preview"
                    style={{ background: `linear-gradient(135deg, ${meta.g1}, ${meta.g2})` }}
                    onClick={() => {
                      setMobileActive(w.appId);
                      setMobileView("app");
                    }}
                  >
                    <span className="app-mgr-preview-icon">
                      <Icon size={28} />
                    </span>
                  </button>
                  <div className="app-mgr-bar">
                    <span className="app-mgr-label">{meta.label}</span>
                    <button
                      type="button"
                      className="app-mgr-opt-btn app-mgr-opt-close"
                      title="Close"
                      onClick={() => closeWindow(w.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <nav className="android-nav-bar" aria-label="Android navigation">
          <button type="button" className="android-nav-btn" onClick={goHome} aria-label="Home">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <circle cx="12" cy="12" r="8" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}
