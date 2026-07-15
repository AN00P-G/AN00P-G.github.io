import { useEffect, useRef, useState } from "react";
import { useOS } from "./context.jsx";

const PROMPT = "anoop@portfolio:~$";
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const ASCII = `
    ___                               ______                             _     
   /   |  ____  ____  ____  ____     / ____/_  ___________ _____ _____ _(_)___ 
  / /| | / __ \\/ __ \\/ __ \\/ __ \\   / / __/ / / / ___/ __ \`/ __ \`/ __ \`/ / __ \\
 / ___ |/ / / / /_/ / /_/ / /_/ /  / /_/ / /_/ / /  / /_/ / /_/ / /_/ / / / / /
/_/  |/_/ /_/\\____/\\____/ .___/   \\____/\\__,_/_/   \\__,_/\\__, /\\__,_/_/_/ /_/ 
                        /_/                              /____/                
`.trimEnd();

function Line({ type, text, promptText }) {
  if (type === "cmd") {
    return (
      <div className={`log-line ${type}`}>
        <span className="prompt">{promptText} </span>
        <span className="cmd-text">{text}</span>
      </div>
    );
  }
  return <div className={`log-line ${type}`}>{text}</div>;
}

export default function Terminal() {
  const { terminalOpen, terminalBoot, closeTerminal, finishBoot, openApp } = useOS();
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const bootRan = useRef(false);

  useEffect(() => {
    if (!terminalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeTerminal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [terminalOpen, closeTerminal]);

  useEffect(() => {
    if (terminalOpen && !terminalBoot) {
      inputRef.current?.focus();
    }
  }, [terminalOpen, terminalBoot]);

  useEffect(() => {
    logRef.current && (logRef.current.scrollTop = logRef.current.scrollHeight);
  }, [lines]);

  useEffect(() => {
    if (!terminalBoot || bootRan.current) return;
    bootRan.current = true;
    let cancelled = false;

    const append = (type, text, promptText) => {
      if (cancelled) return;
      setLines((prev) => [...prev, { type, text, promptText }]);
    };

    (async () => {
      await pause(400);
      append("cmd", "echo Welcome to my portfolio!", PROMPT);
      append("info", "> Welcome to my portfolio! Feel free to look around...");
      await pause(800);
      append("cmd", "curl -I portfolio", PROMPT);
      append("info", "> Resolving...");
      await pause(400);
      append("step", "> Connecting...");
      await pause(400);
      append("step", "> TLS handshake complete");
      await pause(400);
      append("step", "> Sending request");
      await pause(300);
      append("info", "> HTTP 200 OK");
      append("step", "> Rendering desktop...");
      await pause(400);
      append("ok", "✔ Boot complete");
      for (let i = 3; i >= 1; i--) {
        append("info", `> Opening About in ${i}...`);
        await pause(700);
      }
      if (!cancelled) finishBoot();
    })();

    return () => {
      cancelled = true;
    };
  }, [terminalBoot, finishBoot]);

  if (!terminalOpen) return null;

  const runCommand = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setLines((prev) => [
      ...prev,
      { type: "cmd", text: cmd, promptText: PROMPT },
    ]);
    setInput("");

    const lower = cmd.toLowerCase();
    if (lower === "exit" || lower === "logout") {
      closeTerminal();
      return;
    }
    if (lower === "clear") {
      setLines([]);
      return;
    }
    if (lower === "help") {
      setLines((prev) => [
        ...prev,
        {
          type: "info",
          text: "Commands: about, projects, resume, cat, clear, exit, help",
        },
      ]);
      return;
    }
    if (["about", "projects", "resume", "cat"].includes(lower)) {
      closeTerminal();
      openApp(lower);
      return;
    }
    if (lower.startsWith("echo ")) {
      setLines((prev) => [
        ...prev,
        { type: "info", text: cmd.slice(5) },
      ]);
      return;
    }
    setLines((prev) => [
      ...prev,
      { type: "error", text: `bash: ${cmd}: command not found` },
    ]);
  };

  return (
    <div className="terminal-fullscreen" role="application" aria-label="Terminal">
      <pre className="ascii-art" aria-label="ASCII art banner">
        {ASCII}
      </pre>
      <div id="live-log" className="live-log" ref={logRef} aria-live="polite">
        {lines.map((l, i) => (
          <Line key={i} {...l} />
        ))}
      </div>
      {!terminalBoot && (
        <form
          className="terminal-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            runCommand(input);
          }}
        >
          <span className="prompt">{PROMPT} </span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command"
          />
        </form>
      )}
    </div>
  );
}
