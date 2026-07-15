export default function ProjectsApp() {
  return (
    <div className="projects-section">
      <h1>Projects</h1>
      <div className="projects-grid">
        <div className="project-card">
          <h3>Portfolio Site</h3>
          <p>
            This very website — a desktop OS–inspired personal portfolio built with
            Astro, React, and a custom window manager.
          </p>
          <span className="project-tag">Astro</span>
          <span className="project-tag">React</span>
          <span className="project-tag">CSS</span>
        </div>
        <div className="project-card">
          <h3>ML Classifier</h3>
          <p>
            Trained a neural-network classifier on tabular datasets; explored feature
            importance and model interpretability techniques.
          </p>
          <span className="project-tag">Python</span>
          <span className="project-tag">PyTorch</span>
          <span className="project-tag">scikit-learn</span>
        </div>
        <div className="project-card">
          <h3>CTF Write-ups</h3>
          <p>
            Collection of solutions and notes from various Capture-the-Flag
            competitions — covering web, binary exploitation, and crypto.
          </p>
          <span className="project-tag">Security</span>
          <span className="project-tag">Python</span>
          <span className="project-tag">Bash</span>
        </div>
        <div className="project-card">
          <h3>Automation Scripts</h3>
          <p>
            A library of shell and Python scripts for automating repetitive devops
            tasks — log parsing, backup, and deployment helpers.
          </p>
          <span className="project-tag">Bash</span>
          <span className="project-tag">Python</span>
        </div>
      </div>
    </div>
  );
}
