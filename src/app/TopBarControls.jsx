import { useEffect, useState } from "react";
import { useOS } from "./context.jsx";

/** Clock, Activities toggle, and nav → openApp (single-page shell) */
export default function TopBarControls() {
  const { activitiesOpen, setActivitiesOpen, isMobile, openApp } = useOS();
  const [clock, setClock] = useState("--:--");
  const [date, setDate] = useState("---");
  const [batt, setBatt] = useState("98%");

  useEffect(() => {
    const fmtTime = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" });
    const fmtDay = new Intl.DateTimeFormat([], { weekday: "short", month: "short", day: "numeric" });
    const tick = () => {
      const now = new Date();
      setClock(fmtTime.format(now));
      setDate(fmtDay.format(now));
    };
    tick();
    const id = setInterval(tick, 30_000);
    setBatt(`${Math.floor(Math.random() * 30) + 70}%`);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const clockEl = document.querySelector(".header-clock");
    const dateEl = document.querySelector(".header-date");
    const battEl = document.querySelector(".battery-pct");
    const btn = document.getElementById("activities-toggle");
    if (clockEl) clockEl.textContent = clock;
    if (dateEl) dateEl.textContent = date;
    if (battEl) battEl.textContent = batt;
    if (btn) {
      btn.setAttribute("aria-expanded", String(activitiesOpen));
      btn.classList.toggle("is-open", activitiesOpen);
    }
    document.body.classList.toggle("activities-open", activitiesOpen);
  }, [clock, date, batt, activitiesOpen]);

  useEffect(() => {
    const btn = document.getElementById("activities-toggle");
    if (!btn || isMobile) return;
    const onClick = () => setActivitiesOpen((v) => !v);
    btn.addEventListener("click", onClick);
    return () => btn.removeEventListener("click", onClick);
  }, [isMobile, setActivitiesOpen]);

  useEffect(() => {
    const onNav = (e) => {
      const link = e.target.closest?.(".nav-link[data-app]");
      if (!link) return;
      e.preventDefault();
      openApp(link.getAttribute("data-app"));
      document.querySelectorAll(".nav-link").forEach((l) => {
        l.classList.toggle("nav-link--active", l === link);
      });
    };
    document.addEventListener("click", onNav);
    return () => document.removeEventListener("click", onNav);
  }, [openApp]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setActivitiesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setActivitiesOpen]);

  return null;
}
