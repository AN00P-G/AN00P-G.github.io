import { useState } from "react";

export default function ContactApp() {
  const [panel, setPanel] = useState("github");

  return (
    <div className="about-contact">
      <div className="contact-tabs">
        <button
          type="button"
          className={`contact-tab${panel === "github" ? " active" : ""}`}
          onClick={() => setPanel("github")}
        >
          Github
        </button>
        <button
          type="button"
          className={`contact-tab${panel === "email" ? " active" : ""}`}
          onClick={() => setPanel("email")}
        >
          Email Me
        </button>
      </div>

      {panel === "github" ? (
        <div className="contact-panel" id="panel-github">
          <div className="gh-card">
            <img
              className="gh-avatar"
              src="https://avatars.githubusercontent.com/AN00P-G"
              alt="GitHub avatar"
            />
            <div className="gh-info">
              <p className="gh-name">Anupraj Guragain</p>
              <p className="gh-username">@AN00P-G</p>
              <img
                className="gh-contrib"
                src="https://ghchart.rshah.org/6ef2b6/AN00P-G"
                alt="GitHub contribution chart"
              />
              <a
                className="gh-profile-link"
                href="https://github.com/AN00P-G"
                target="_blank"
                rel="noopener noreferrer"
              >
                View profile ↗
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="contact-panel" id="panel-email">
          <form
            className="contact-form"
            action="https://formspree.io/f/mykdavrl"
            method="POST"
          >
            <label className="cf-label" htmlFor="cf-name">Name:</label>
            <input className="cf-input" id="cf-name" type="text" name="name" placeholder="Your name" required />
            <label className="cf-label" htmlFor="cf-email">Email:</label>
            <input className="cf-input" id="cf-email" type="email" name="email" placeholder="Your email" required />
            <label className="cf-label" htmlFor="cf-subject">Subject:</label>
            <input className="cf-input" id="cf-subject" type="text" name="_subject" placeholder="Subject" required />
            <label className="cf-label" htmlFor="cf-message">Message:</label>
            <textarea className="cf-input cf-textarea" id="cf-message" name="message" placeholder="Your message" required />
            <button className="cf-submit" type="submit">Send Message →</button>
          </form>
        </div>
      )}
    </div>
  );
}
