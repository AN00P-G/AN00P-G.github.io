export default function ResumeApp() {
  return (
    <div className="resume-app">
      <div className="resume-header">
        <div>
          <h1>Anupraj Guragain</h1>
          <p className="resume-meta">guragain.me · github.com/AN00P-G</p>
        </div>
        <a
          className="resume-gh-link"
          href="https://github.com/AN00P-G"
          target="_blank"
          rel="noopener noreferrer"
        >
          View GitHub ↗
        </a>
      </div>

      <div className="resume-section">
        <h2>Education</h2>
        <div className="resume-item">
          <div className="resume-item-head">
            <strong>Allegheny College</strong>
            <span>Aug 2023 – May 2027</span>
          </div>
          <p>B.S. Computer Science · Meadville, PA · GPA: In Progress</p>
        </div>
      </div>

      <div className="resume-section">
        <h2>Experience</h2>
        <div className="resume-item">
          <div className="resume-item-head">
            <strong>Teaching Assistant — Computer Science</strong>
            <span>2024 – Present</span>
          </div>
          <p>
            Allegheny College · Assist in intro-level CS labs, hold office hours, review
            student code, and explain core programming concepts.
          </p>
        </div>
        <div className="resume-item">
          <div className="resume-item-head">
            <strong>Independent Security Research</strong>
            <span>Ongoing</span>
          </div>
          <p>
            Self-directed study in penetration testing and CTF competitions; documented
            findings as write-ups on GitHub.
          </p>
        </div>
      </div>

      <div className="resume-section">
        <h2>Projects</h2>
        <div className="resume-item">
          <div className="resume-item-head">
            <strong>Portfolio Website</strong>
            <span>2024</span>
          </div>
          <p>
            Built a desktop OS–inspired portfolio using Astro 5, React, and a custom
            draggable window-manager component.
          </p>
        </div>
        <div className="resume-item">
          <div className="resume-item-head">
            <strong>ML Interpretability Experiments</strong>
            <span>2024</span>
          </div>
          <p>
            Trained classifiers in PyTorch and scikit-learn; used SHAP and saliency maps
            to explore feature importance.
          </p>
        </div>
      </div>

      <div className="resume-section">
        <h2>Skills</h2>
        <div className="skills-grid">
          {[
            "Python", "JavaScript / TypeScript", "React", "Astro", "C", "Bash",
            "Linux", "Git", "Docker", "PyTorch", "Ethical Hacking",
          ].map((s) => (
            <span key={s} className="skill-chip">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
