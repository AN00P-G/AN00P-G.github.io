import { useState } from "react";
import { useOS } from "../context.jsx";

export default function CatApp() {
  const { closeApp } = useOS();
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <div className="cat-intro">
        <h1 className="cat-warn-title">⚠ Extreme Seizure Warning</h1>
        <p className="cat-warn-copy">
          This page contains rapidly flashing content. Continue only if you are
          comfortable.
        </p>
        <div className="cat-actions">
          <button type="button" id="continueBtn" onClick={() => setPlaying(true)}>
            Yes, continue →
          </button>
          <button type="button" id="noBtn" onClick={() => closeApp("cat")}>
            No thanks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cat-video">
      <iframe
        src="https://www.youtube.com/embed/IxX_QHay02M?autoplay=1&mute=0&loop=1&playlist=IxX_QHay02M&controls=0&modestbranding=1&rel=0&disablekb=1"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
