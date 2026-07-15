import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  APPS,
  BREAKPOINT,
  resolveGeometry,
  getDesktopSize,
  clampWindow,
  FALLBACK_DESKTOP,
} from "./registry.js";

const OSContext = createContext(null);

let winSeq = 0;

function makeWindow(appId, desktop = FALLBACK_DESKTOP) {
  const meta = APPS[appId];
  if (!meta || meta.fullscreen) return null;
  const geo = resolveGeometry(appId, desktop);
  if (!geo) return null;
  return {
    id: `win-${++winSeq}`,
    appId,
    ...geo,
    minimized: false,
    maximized: false,
    z: winSeq,
  };
}

function initialWindows(initialApps, bootTerminal) {
  if (bootTerminal) return [];
  const ids = Array.isArray(initialApps) ? initialApps : initialApps ? [initialApps] : [];
  return ids.map((id) => makeWindow(id)).filter(Boolean);
}

export function OSProvider({
  children,
  initialApp = null,
  initialApps = null,
  bootTerminal = false,
}) {
  const seed = initialApps ?? (initialApp ? [initialApp] : null);
  const [windows, setWindows] = useState(() => initialWindows(seed, bootTerminal));
  const [terminalOpen, setTerminalOpen] = useState(Boolean(bootTerminal));
  const [terminalBoot, setTerminalBoot] = useState(Boolean(bootTerminal));
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const firstApp = seed?.[0] && seed[0] !== "terminal" ? seed[0] : null;
  const [mobileView, setMobileView] = useState(
    () => (!bootTerminal && firstApp ? "app" : "home"),
  );
  const [mobileActive, setMobileActive] = useState(
    () => (!bootTerminal && firstApp ? firstApp : null),
  );
  const [isMobile, setIsMobile] = useState(false);
  const [zCounter, setZCounter] = useState(() => Math.max(winSeq, 1));

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fit windows to real desktop size after mount; on resize only clamp (don't reset layouts)
  useEffect(() => {
    if (isMobile) return undefined;

    let didInitialLayout = false;

    const apply = () => {
      const desktop = getDesktopSize();
      setWindows((ws) =>
        ws.map((w) => {
          if (w.maximized) return w;
          if (!didInitialLayout) {
            const geo = resolveGeometry(w.appId, desktop);
            return geo ? { ...w, ...geo } : { ...w, ...clampWindow(w, desktop) };
          }
          return { ...w, ...clampWindow(w, desktop) };
        }),
      );
      didInitialLayout = true;
    };

    const t = requestAnimationFrame(apply);
    window.addEventListener("resize", apply);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("resize", apply);
    };
  }, [isMobile]);

  const focusWindow = useCallback((id) => {
    setWindows((ws) => {
      const topZ = ws.reduce((m, w) => Math.max(m, w.z), 0);
      const target = ws.find((w) => w.id === id);
      if (!target) return ws;
      if (target.z >= topZ && !target.minimized) return ws;
      const nextZ = topZ + 1;
      setZCounter(nextZ);
      return ws.map((w) =>
        w.id === id ? { ...w, z: nextZ, minimized: false } : w,
      );
    });
  }, []);

  const openApp = useCallback(
    (appId) => {
      if (!APPS[appId]) return;

      if (appId === "terminal") {
        setTerminalOpen(true);
        setTerminalBoot(false);
        setActivitiesOpen(false);
        return;
      }

      setActivitiesOpen(false);

      if (isMobile) {
        setMobileActive(appId);
        setMobileView("app");
        setWindows((ws) => {
          if (ws.some((w) => w.appId === appId)) return ws;
          const win = makeWindow(appId, getDesktopSize());
          return win ? [...ws, win] : ws;
        });
        return;
      }

      setWindows((ws) => {
        const existing = ws.find((w) => w.appId === appId);
        if (existing) {
          const nextZ = zCounter + 1;
          setZCounter(nextZ);
          return ws.map((w) =>
            w.id === existing.id
              ? { ...w, minimized: false, maximized: false, z: nextZ }
              : w,
          );
        }
        const nextZ = zCounter + 1;
        setZCounter(nextZ);
        const win = makeWindow(appId, getDesktopSize());
        if (!win) return ws;
        win.z = nextZ;
        return [...ws, win];
      });
    },
    [isMobile, zCounter],
  );

  const openApps = useCallback(
    (appIds) => {
      appIds.forEach((id, i) => {
        setTimeout(() => openApp(id), i * 40);
      });
    },
    [openApp],
  );

  const closeApp = useCallback((appIdOrWinId) => {
    setWindows((ws) =>
      ws.filter((w) => w.id !== appIdOrWinId && w.appId !== appIdOrWinId),
    );
    setMobileActive((cur) => {
      if (cur === appIdOrWinId) {
        setMobileView("home");
        return null;
      }
      return cur;
    });
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows((ws) => {
      const closing = ws.find((w) => w.id === id);
      if (closing) {
        setMobileActive((cur) => {
          if (cur === closing.appId) {
            setMobileView("home");
            return null;
          }
          return cur;
        });
      }
      return ws.filter((w) => w.id !== id);
    });
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, minimized: true, maximized: false } : w)),
    );
  }, []);

  const restoreWindow = useCallback(
    (id) => {
      focusWindow(id);
    },
    [focusWindow],
  );

  const toggleMaximize = useCallback((id) => {
    setWindows((ws) =>
      ws.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized, minimized: false } : w,
      ),
    );
  }, []);

  const updateWindow = useCallback((id, patch) => {
    setWindows((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w;
        const next = { ...w, ...patch };
        if (next.maximized) return next;
        const clamped = clampWindow(
          { x: next.x, y: next.y, w: next.w, h: next.h },
          getDesktopSize(),
        );
        return { ...next, ...clamped };
      }),
    );
  }, []);

  const closeTerminal = useCallback(() => {
    setTerminalOpen(false);
    setTerminalBoot(false);
  }, []);

  const openTerminal = useCallback(() => {
    setTerminalOpen(true);
    setTerminalBoot(false);
    setActivitiesOpen(false);
  }, []);

  const finishBoot = useCallback(() => {
    setTerminalOpen(false);
    setTerminalBoot(false);
    const desktop = getDesktopSize();
    const ids = ["about", "image", "contact"];
    setWindows(() =>
      ids
        .map((id) => {
          const win = makeWindow(id, desktop);
          if (win) win.z = ++winSeq;
          return win;
        })
        .filter(Boolean),
    );
    setZCounter(winSeq);
    setMobileActive("about");
    setMobileView("app");
  }, []);

  const goHome = useCallback(() => {
    setMobileView("home");
    setMobileActive(null);
  }, []);

  const openRecents = useCallback(() => {
    setMobileView("recents");
  }, []);

  const value = useMemo(
    () => ({
      windows,
      terminalOpen,
      terminalBoot,
      activitiesOpen,
      setActivitiesOpen,
      mobileView,
      mobileActive,
      isMobile,
      openApp,
      openApps,
      closeApp,
      closeWindow,
      minimizeWindow,
      restoreWindow,
      toggleMaximize,
      focusWindow,
      updateWindow,
      closeTerminal,
      openTerminal,
      finishBoot,
      goHome,
      openRecents,
      setMobileView,
      setMobileActive,
    }),
    [
      windows,
      terminalOpen,
      terminalBoot,
      activitiesOpen,
      mobileView,
      mobileActive,
      isMobile,
      openApp,
      openApps,
      closeApp,
      closeWindow,
      minimizeWindow,
      restoreWindow,
      toggleMaximize,
      focusWindow,
      updateWindow,
      closeTerminal,
      openTerminal,
      finishBoot,
      goHome,
      openRecents,
    ],
  );

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useOS() {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error("useOS must be used within OSProvider");
  return ctx;
}
