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
    const check = () => setIsMobile(window.innerWidth <= 768);
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
// Desktop window — normal flow, draggable, resizable, constrained
// ─────────────────────────────────────────────────────────────────────────────
function DesktopWindow({ children, title, menuItems, monospace, noPad, height, width }) {
  const [closed,    setClosed]    = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [pos,  setPos]  = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: null, h: null }); // null → use CSS
  const winRef   = useRef(null);
  const interRef = useRef(null); // { type:'drag'|'resize', dir, startX,startY, ox,oy,ow,oh, rect, screenRect }

  // ── Minimize via direct DOM class so taskbar JS can also toggle it ────────
  const minimize = () => winRef.current?.classList.add("lw-minimized");
  const restore  = () => {
    winRef.current?.classList.remove("lw-minimized");
    setMaximized(false);
  };

  // Expose on DOM element so Footer.astro taskbar can call them via events
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

  // ── Shared pointer-move / up handler ─────────────────────────────────────
  useEffect(() => {
    if (!interRef.current) return;

    const onMove = (e) => {
      const d = interRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      if (d.type === "drag") {
        let nx = d.ox + dx;
        let ny = d.oy + dy;
        // Constrain inside screen (keep at least 40px of title bar visible)
        if (d.sr && d.rect) {
          const minX = d.sr.left  - d.rect.right  + 60 + d.ox;
          const maxX = d.sr.right - d.rect.left   - 60 + d.ox;
          const minY = (d.sr.top + 32) - d.rect.top  + d.oy;
          const maxY = d.sr.bottom     - d.rect.top - 40 + d.oy;
          nx = Math.max(minX, Math.min(maxX, nx));
          ny = Math.max(minY, Math.min(maxY, ny));
        }
        setPos({ x: nx, y: ny });

      } else if (d.type === "resize") {
        let nw = d.ow, nh = d.oh, nx = d.ox, ny = d.oy;
        if (d.dir.includes("e"))  nw = Math.max(240, d.ow + dx);
        if (d.dir.includes("s"))  nh = Math.max(120, d.oh + dy);
        if (d.dir.includes("w")) { nw = Math.max(240, d.ow - dx); nx = d.ox + (d.ow - nw); }
        if (d.dir.includes("n")) { nh = Math.max(120, d.oh - dy); ny = d.oy + (d.oh - nh); }
        setSize({ w: nw, h: nh });
        setPos ({ x: nx, y: ny  });
      }
    };

    const onUp = () => {
      interRef.current = null;
      // force re-render to clear cursor style
      winRef.current?.classList.remove("lw-dragging", "lw-resizing");
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  });

  // Reset offset when maximized
  useEffect(() => { if (maximized) setPos({ x: 0, y: 0 }); }, [maximized]);

  const startDrag = (e) => {
    if (maximized || e.target.closest(".lw-wm-buttons, .lw-resize")) return;
    const rect = winRef.current?.getBoundingClientRect();
    const sr   = document.getElementById("screen")?.getBoundingClientRect();
    interRef.current = { type: "drag", startX: e.clientX, startY: e.clientY,
      ox: pos.x, oy: pos.y, rect, sr };
    winRef.current?.classList.add("lw-dragging");
    e.preventDefault();
  };

  const startResize = (dir) => (e) => {
    if (maximized) return;
    const rect = winRef.current?.getBoundingClientRect();
    interRef.current = { type: "resize", dir,
      startX: e.clientX, startY: e.clientY,
      ox: pos.x, oy: pos.y,
      ow: size.w ?? rect?.width  ?? 400,
      oh: size.h ?? rect?.height ?? 300,
    };
    winRef.current?.classList.add("lw-resizing");
    e.preventDefault();
    e.stopPropagation();
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
      {/* Title bar */}
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
            onClick={() => { setMaximized((v) => !v); winRef.current?.classList.remove("lw-minimized"); }}
          >{maximized ? "⊡" : "□"}</span>
          <span className="lw-btn lw-close"
            title="Close"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setClosed(true)}>×</span>
        </div>
      </div>

      {/* Menu bar */}
      {menuItems.length > 0 && (
        <div className="lw-menubar">
          {menuItems.map((m, i) => <span key={i} className="lw-menu-item">{m}</span>)}
        </div>
      )}

      {/* Body */}
      <div className={`lw-body${monospace ? " lw-mono" : ""}${noPad ? " lw-nopad" : ""}`}>
        {children}
      </div>

      {/* Resize handles (8 directions) */}
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
// MobileCard — Android-style full-width card
// ─────────────────────────────────────────────────────────────────────────────
function MobileCard({ cardId, title, menuItems, monospace, noPad, children }) {
  const [maximized, setMaximized] = useState(false);
  const [closed,    setClosed]    = useState(false);
  const [showMenu,  setShowMenu]  = useState(false);

  const maximize = () => { setMaximized(true);  document.body.classList.add("mobile-maximized"); };
  const restore  = () => { setMaximized(false); document.body.classList.remove("mobile-maximized"); };

  if (closed) return null;

  return (
    <div
      id={cardId}
      className={`mobile-card lw-container${maximized ? " mobile-card--maximized" : ""}`}
      data-app-title={title}
    >
      <div className="lw-titlebar mobile-titlebar" onClick={() => !maximized && maximize()}>
        <span className="lw-title">{title}</span>
        <div className="lw-wm-buttons">
          {maximized && (
            <span className="lw-btn lw-min" title="Restore"
              onClick={(e) => { e.stopPropagation(); restore(); }}>⌄</span>
          )}
          <span className="lw-btn mobile-menu-dots" title="Options"
            onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}>⋮</span>
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
