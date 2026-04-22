import React, { useState, useEffect, useRef } from "react";

let _idCounter = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────
export default function WindowManager({
  children,
  title     = "anoop@portfolio: ~",
  menuItems = ["File", "Edit", "View", "Help"],
  monospace = false,
  noPad     = false,
  height    = "auto",
  width     = "100%",
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const cardId = useRef(`mobile-card-${++_idCounter}`);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!mounted) {
    return <div className="lw-placeholder" style={{ width, minHeight: "4rem" }} />;
  }

  if (isMobile) {
    return (
      <MobileCard cardId={cardId.current} title={title} menuItems={menuItems}
        monospace={monospace} noPad={noPad}>
        {children}
      </MobileCard>
    );
  }

  return (
    <DesktopWindow title={title} menuItems={menuItems}
      monospace={monospace} noPad={noPad} height={height} width={width}>
      {children}
    </DesktopWindow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop window — draggable & resizable with correct event handling
// ─────────────────────────────────────────────────────────────────────────────
function DesktopWindow({ children, title, menuItems, monospace, noPad, height, width }) {
  const [closed,    setClosed]    = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [pos,  setPos]  = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: null, h: null });
  const winRef = useRef(null);

  // Minimize via direct DOM class so Footer taskbar JS can also toggle it
  const minimize = () => winRef.current?.classList.add("lw-minimized");
  const restore  = () => {
    winRef.current?.classList.remove("lw-minimized");
    setMaximized(false);
  };

  useEffect(() => {
    const el = winRef.current;
    if (!el) return;
    const onMin     = () => minimize();
    const onRestore = () => restore();
    el.addEventListener("lw:minimize", onMin);
    el.addEventListener("lw:restore",  onRestore);
    return () => {
      el.removeEventListener("lw:minimize", onMin);
      el.removeEventListener("lw:restore",  onRestore);
    };
  }, []);

  // Reset translate when maximized
  useEffect(() => { if (maximized) setPos({ x: 0, y: 0 }); }, [maximized]);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const startDrag = (e) => {
    if (maximized || e.button !== 0) return;
    if (e.target.closest(".lw-wm-buttons, .lw-resize")) return;
    e.preventDefault();

    const winEl  = winRef.current;
    if (!winEl) return;
    const rect   = winEl.getBoundingClientRect();
    const srEl   = document.getElementById("screen");
    const sr     = srEl ? srEl.getBoundingClientRect() : null;
    const startX = e.clientX, startY = e.clientY;
    const ox = pos.x, oy = pos.y;

    winEl.classList.add("lw-dragging");

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let nx = ox + dx;
      let ny = oy + dy;
      if (sr && rect) {
        nx = Math.max(sr.left  - rect.right  + 60 + ox, Math.min(sr.right  - rect.left  - 60 + ox, nx));
        ny = Math.max(sr.top   + 32 - rect.top   + oy, Math.min(sr.bottom - rect.top   - 40 + oy, ny));
      }
      setPos({ x: nx, y: ny });
    };

    const onUp = () => {
      winEl.classList.remove("lw-dragging");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  // ── Resize ────────────────────────────────────────────────────────────────
  const startResize = (dir) => (e) => {
    if (maximized || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const winEl  = winRef.current;
    if (!winEl) return;
    const rect   = winEl.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    const ox = pos.x, oy = pos.y;
    const ow = size.w ?? rect.width;
    const oh = size.h ?? rect.height;

    winEl.classList.add("lw-resizing");

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let nw = ow, nh = oh, nx = ox, ny = oy;
      if (dir.includes("e"))  nw = Math.max(240, ow + dx);
      if (dir.includes("s"))  nh = Math.max(120, oh + dy);
      if (dir.includes("w")) { nw = Math.max(240, ow - dx); nx = ox + (ow - nw); }
      if (dir.includes("n")) { nh = Math.max(120, oh - dy); ny = oy + (oh - nh); }
      setSize({ w: nw, h: nh });
      setPos ({ x: nx, y: ny });
    };

    const onUp = () => {
      winEl.classList.remove("lw-resizing");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  if (closed) return null;

  const transform = !maximized && (pos.x || pos.y)
    ? `translate(${pos.x}px, ${pos.y}px)` : undefined;

  const winStyle = {
    transform,
    width:  size.w ? `${size.w}px` : width,
    height: maximized ? undefined : (size.h ? `${size.h}px` : height),
  };

  return (
    <div
      ref={winRef}
      className={`lw-container${maximized ? " lw-maximized" : ""}`}
      style={winStyle}
    >
      <div className="lw-titlebar" onMouseDown={startDrag}>
        <span className="lw-title">{title}</span>
        <div className="lw-wm-buttons">
          <span className="lw-btn lw-min"
            title="Minimize"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={minimize}>−</span>
          <span className="lw-btn lw-max"
            title={maximized ? "Restore" : "Maximize"}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => { setMaximized(v => !v); winRef.current?.classList.remove("lw-minimized"); }}
          >{maximized ? "⊡" : "□"}</span>
          <span className="lw-btn lw-close"
            title="Close"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setClosed(true)}>×</span>
        </div>
      </div>

      {menuItems.length > 0 && (
        <div className="lw-menubar">
          {menuItems.map((m, i) => <span key={i} className="lw-menu-item">{m}</span>)}
        </div>
      )}

      <div className={`lw-body${monospace ? " lw-mono" : ""}${noPad ? " lw-nopad" : ""}`}>
        {children}
      </div>

      {!maximized && (
        <>
          <div className="lw-resize lw-resize-n"  onMouseDown={startResize("n")} />
          <div className="lw-resize lw-resize-s"  onMouseDown={startResize("s")} />
          <div className="lw-resize lw-resize-e"  onMouseDown={startResize("e")} />
          <div className="lw-resize lw-resize-w"  onMouseDown={startResize("w")} />
          <div className="lw-resize lw-resize-ne" onMouseDown={startResize("ne")} />
          <div className="lw-resize lw-resize-nw" onMouseDown={startResize("nw")} />
          <div className="lw-resize lw-resize-se" onMouseDown={startResize("se")} />
          <div className="lw-resize lw-resize-sw" onMouseDown={startResize("sw")} />
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MobileCard — Android-style app card
// ─────────────────────────────────────────────────────────────────────────────
function MobileCard({ cardId, title, menuItems, monospace, noPad, children }) {
  const [maximized, setMaximized] = useState(false);
  const [closed,    setClosed]    = useState(false);
  const [showMenu,  setShowMenu]  = useState(false);

  const maximize = () => {
    setMaximized(true);
    document.body.classList.add("mobile-maximized");
  };
  const restore = () => {
    setMaximized(false);
    document.body.classList.remove("mobile-maximized");
  };

  if (closed) return null;

  return (
    <div
      id={cardId}
      className={`mobile-card lw-container${maximized ? " mobile-card--maximized" : ""}`}
      data-app-title={title}
    >
      <div
        className="lw-titlebar mobile-titlebar"
        onClick={() => !maximized && maximize()}
      >
        <span className="lw-title">{title}</span>
        <div className="lw-wm-buttons">
          {maximized && (
            <span className="lw-btn lw-min" title="Restore"
              onClick={(e) => { e.stopPropagation(); restore(); }}>⌄</span>
          )}
          <span className="lw-btn mobile-menu-dots" title="Options"
            onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}>⋮</span>
          <span className="lw-btn lw-close" title="Close"
            onClick={(e) => { e.stopPropagation(); restore(); setClosed(true); }}>×</span>
        </div>

        {showMenu && (
          <div className="mobile-context-menu" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setShowMenu(false); maximize(); }}>Open full screen</button>
            <button onClick={() => { setShowMenu(false); restore(); setClosed(true); }}>Close app</button>
            <button onClick={() => { setShowMenu(false); window.location.reload(); }}>Refresh</button>
          </div>
        )}
      </div>

      {menuItems.length > 0 && (
        <div className="lw-menubar">
          {menuItems.map((m, i) => <span key={i} className="lw-menu-item">{m}</span>)}
        </div>
      )}

      <div className={`lw-body${monospace ? " lw-mono" : ""}${noPad ? " lw-nopad" : ""}`}>
        {children}
      </div>
    </div>
  );
}
