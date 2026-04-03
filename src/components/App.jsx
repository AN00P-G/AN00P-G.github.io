import React, { useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function WindowManager({ 
  children, 
  title = "anoop@portfolio: ~",
  menuItems = ["File", "Edit", "View", "Help"],
  monospace = false,
  noPad = false,
  items = 1,
  height = "600px",
  width = "1000px"
}) {
  const [layouts, setLayouts] = useState({ lg: [], md: [], sm: [], xs: [] });
  const [zIndexCounter, setZIndexCounter] = useState(1000);
  const [windowStates, setWindowStates] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize layout on client
  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth <= 768);
    
    const initialLayouts = generateLayouts();
    setLayouts(initialLayouts);
    
    // Initialize window states
    const states = {};
    initialLayouts.lg.forEach((item) => {
      states[item.i] = {
        minimized: false,
        maximized: false,
        zIndex: 1000 + parseInt(item.i),
        preMaxPos: null
      };
    });
    setWindowStates(states);

    // Handle window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [items]);

  const generateLayouts = () => {
    const layoutsObj = {};
    const breakpointConfigs = {
      lg: { cols: 12, w: 4, h: 15 },
      md: { cols: 10, w: 6, h: 15 },
      sm: { cols: 6, w: 6, h: 15 },
      xs: { cols: 4, w: 4, h: 15 }
    };
    
    Object.entries(breakpointConfigs).forEach(([breakpoint, config]) => {
      layoutsObj[breakpoint] = Array.from({ length: items }, (_, i) => ({
        x: (i * 2) % config.cols,
        y: Math.floor(i / (config.cols / 2)) * config.h,
        w: config.w,
        h: config.h,
        i: i.toString(),
        static: false
      }));
    });
    
    return layoutsObj;
  };

  const onLayoutChange = (newLayout, allLayouts) => {
    // Bound windows to container - prevent going off-screen
    const maxX = 12 - 1; // Leave room for min width
    const maxY = 50; // Reasonable max Y
    
    const boundedLayout = newLayout.map(item => {
      const bounded = { ...item };
      // Keep x/y positive and within reasonable bounds
      if (bounded.x < 0) bounded.x = 0;
      if (bounded.y < 0) bounded.y = 0;
      if (bounded.x > maxX) bounded.x = maxX;
      if (bounded.y > maxY) bounded.y = maxY;
      return bounded;
    });
    setLayouts(prevLayouts => ({
      ...prevLayouts,
      lg: boundedLayout
    }));
  };

  const handleMinimize = (id) => {
    setWindowStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        minimized: !prev[id].minimized,
        maximized: false
      }
    }));
  };

  const handleMaximize = (id) => {
    setWindowStates(prev => {
      const state = prev[id];
      const newState = { ...state, maximized: !state.maximized };
      
      if (!state.maximized) {
        // Save current position if not already saved
        if (!state.preMaxPos) {
          const item = layouts.lg.find(l => l.i === id);
          newState.preMaxPos = item ? { ...item } : null;
        }
      } else if (state.preMaxPos) {
        // Restore from saved position
        const restoredLayout = layouts.lg.map(item =>
          item.i === id ? state.preMaxPos : item
        );
        setLayouts(prevLayouts => ({
          ...prevLayouts,
          lg: restoredLayout
        }));
        newState.preMaxPos = null;
      }
      
      return {
        ...prev,
        [id]: newState
      };
    });
  };

  const handleClose = (id) => {
    setLayouts(prevLayouts => ({
      ...prevLayouts,
      lg: prevLayouts.lg.filter(item => item.i !== id),
      md: prevLayouts.md.filter(item => item.i !== id),
      sm: prevLayouts.sm.filter(item => item.i !== id),
      xs: prevLayouts.xs.filter(item => item.i !== id)
    }));
    setWindowStates(prev => {
      const newStates = { ...prev };
      delete newStates[id];
      return newStates;
    });
  };

  const handleBringToFront = (id) => {
    const newZIndex = zIndexCounter + 1;
    setZIndexCounter(newZIndex);
    setWindowStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        zIndex: newZIndex
      }
    }));
  };

  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4 };

  if (!mounted) {
    return <div className="window-manager-container"></div>;
  }

  return (
    <div className="window-manager-container">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={30}
        width={1200}
        isDraggable={!isMobile}
        isResizable={!isMobile}
        compactType={null}
        preventCollision={false}
        allowOverlap={true}
        useCSSTransforms={true}
        onLayoutChange={onLayoutChange}
        containerPadding={[0, 0]}
        margin={[0, 0]}
        draggableHandle=".lw-titlebar"
      >
        {layouts.lg.map((item) => {
          const state = windowStates[item.i] || {};
          if (state.minimized) return null;

          return (
            <div
              key={item.i}
              className={`lw-container ${state.maximized ? "lw-maximized" : ""}`}
              style={{
                zIndex: state.zIndex
              }}
              onClick={() => handleBringToFront(item.i)}
            >
              {/* Title bar */}
              <div className="lw-titlebar">
                <span className="lw-title">{title}</span>
                <div className="lw-wm-buttons">
                  <span
                    className="lw-btn lw-min"
                    title="Minimize"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMinimize(item.i);
                    }}
                  >
                    &#8722;
                  </span>
                  <span
                    className="lw-btn lw-max"
                    title="Maximize"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMaximize(item.i);
                    }}
                  >
                    {state.maximized ? "&#10697;" : "&#9633;"}
                  </span>
                  <span
                    className="lw-btn lw-close"
                    title="Close"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose(item.i);
                    }}
                  >
                    &#10005;
                  </span>
                </div>
              </div>

              {/* Menu bar */}
              {menuItems.length > 0 && (
                <div className="lw-menubar">
                  {menuItems.map((menuItem, idx) => (
                    <span key={idx} className="lw-menu-item">
                      {menuItem}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <div
                className={`lw-body ${monospace ? "lw-mono" : ""} ${
                  noPad ? "lw-nopad" : ""
                }`}
              >
                {children}
              </div>

              {/* Resize handles - only visible when not maximized */}
              {!state.maximized && (
                <>
                  <div className="lw-resize lw-resize-n"></div>
                  <div className="lw-resize lw-resize-s"></div>
                  <div className="lw-resize lw-resize-e"></div>
                  <div className="lw-resize lw-resize-w"></div>
                  <div className="lw-resize lw-resize-ne"></div>
                  <div className="lw-resize lw-resize-nw"></div>
                  <div className="lw-resize lw-resize-se"></div>
                  <div className="lw-resize lw-resize-sw"></div>
                </>
              )}
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
