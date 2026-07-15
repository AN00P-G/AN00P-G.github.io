import { useEffect } from "react";
import { OSProvider, useOS } from "./context.jsx";
import Window from "./Window.jsx";
import Dock from "./Dock.jsx";
import Activities from "./Activities.jsx";
import Terminal from "./Terminal.jsx";
import MobileHome from "./MobileHome.jsx";
import MobileRecents, { MobileAppView } from "./MobileRecents.jsx";
import TopBarControls from "./TopBarControls.jsx";
import { startParticles } from "../scripts/particles.js";

function DesktopInner() {
  const {
    windows,
    isMobile,
    mobileView,
    terminalOpen,
  } = useOS();

  useEffect(() => {
    const el = document.getElementById("particle-canvas");
    if (!el) return undefined;
    const net = startParticles(el, {
      particleColor: "#6ef2b6",
      background: "#080c14",
      interactive: true,
      speed: "slow",
      density: "high",
    });
    return () => net?.destroy();
  }, []);

  useEffect(() => {
    const el = document.getElementById("particle-canvas");
    if (!el) return;
    el.style.visibility = terminalOpen ? "hidden" : "visible";
  }, [terminalOpen]);

  if (isMobile) {
    return (
      <>
        <TopBarControls />
        {mobileView === "home" && <MobileHome />}
        {mobileView === "app" && <MobileAppView />}
        {mobileView === "recents" && <MobileRecents />}
        <Terminal />
      </>
    );
  }

  return (
    <>
      <TopBarControls />
      <div className="desktop-layer">
        {[...windows]
          .sort((a, b) => a.z - b.z)
          .map((w) => (
            <Window key={w.id} win={w} />
          ))}
      </div>
      <Dock />
      <Activities />
      <Terminal />
    </>
  );
}

/**
 * Single OS shell. Astro pages mount this with client:load.
 * @param {{ initialApp?: string | null, initialApps?: string[] | null, bootTerminal?: boolean }} props
 */
export default function Desktop({
  initialApp = null,
  initialApps = null,
  bootTerminal = false,
}) {
  return (
    <OSProvider
      initialApp={initialApp}
      initialApps={initialApps}
      bootTerminal={bootTerminal}
    >
      <DesktopInner />
    </OSProvider>
  );
}
