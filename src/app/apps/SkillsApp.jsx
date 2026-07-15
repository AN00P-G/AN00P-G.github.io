export default function SkillsApp() {
  return (
    <div className="projects-section">
      <h1>Skills</h1>
      <div className="skills-grid">
        {[
          "Python", "JavaScript / TypeScript", "React", "Astro", "HTML / CSS",
          "Bash / Shell", "C", "Git", "Linux", "PyTorch", "scikit-learn",
          "Docker", "Ethical Hacking", "CTF / Pentesting",
        ].map((s) => (
          <span key={s} className="skill-chip">{s}</span>
        ))}
      </div>
    </div>
  );
}
