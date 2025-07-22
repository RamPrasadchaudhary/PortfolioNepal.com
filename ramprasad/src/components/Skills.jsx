import React from 'react';
import '../Style/skills.css';

const skills = [
  { name: 'HTML / CSS / JavaScript', icon: '🌐' },
  { name: 'React.js', icon: '⚛️' },
  { name: 'Node.js & Express', icon: '🟢' },
  { name: 'Python', icon: '🐍' },
  { name: 'Java', icon: '☕' },
  { name: 'Android', icon: '🤖' },
  { name: 'Laravel', icon: '🅻' },
  { name: 'Spring Boot', icon: '🌱' },
  { name: 'MySQL', icon: '🗄️' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'Git & GitHub', icon: '🐙' },
  { name: 'Bootstrap / Tailwind CSS', icon: '🎨' },
];

const Skills = () => (
  <section id="skills" className="skills-section-3d">
    <h2 className="skills-title-3d">Skills</h2>
    <ul className="skills-list-3d">
      {skills.map((skill, idx) => (
        <li className="skill-card-3d" key={idx}>
          <div className="skill-icon-3d">{skill.icon}</div>
          <span className="skill-name-3d">{skill.name}</span>
        </li>
      ))}
    </ul>
  </section>
);

export default Skills;