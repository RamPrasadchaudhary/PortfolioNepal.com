import React from 'react';
import '../Style/skills.css';
import { 
  FaHtml5, FaReact, FaNodeJs, FaPython, FaJava, 
  FaAndroid, FaLaravel, FaDatabase, FaGitAlt, FaPalette 
} from 'react-icons/fa';
import { SiMongodb, SiSpringboot, SiTailwindcss, SiMysql } from 'react-icons/si';

const skillData = [
  { name: 'Frontend Dev', desc: 'React, HTML, CSS, JS', icon: <FaReact />, color: '#61DAFB' },
  { name: 'Node.js', desc: 'Backend Systems', icon: <FaNodeJs />, color: '#339933' },
  { name: 'Python', desc: 'Scripting & AI', icon: <FaPython />, color: '#3776AB' },
  { name: 'Database', desc: 'MySQL & MongoDB', icon: <FaDatabase />, color: '#4479A1' },
  { name: 'Mobile', desc: 'Android Development', icon: <FaAndroid />, color: '#3DDC84' },
  { name: 'Frameworks', desc: 'Laravel & Spring', icon: <SiSpringboot />, color: '#6DB33F' },
  { name: 'UI / UX', desc: 'Tailwind & Design', icon: <FaPalette />, color: '#38B2AC' },
  { name: 'Version Control', desc: 'Git & GitHub', icon: <FaGitAlt />, color: '#F05032' },
];

const Skills = () => (
  <section id="skills" className="skills-premium-v3">
    <div className="skills-container">
      <div className="skills-header">
        <span className="eyebrow-v3">Capabilities</span>
        <h2 className="title-v3">Skills & <span>Expertise</span></h2>
        <p className="skills-subtitle">
          Turning complex requirements into elegant, functional codebases.
        </p>
      </div>

      <div className="skills-grid-v3">
        {skillData.map((skill, idx) => (
          <div className="skill-item-v3" key={idx}>
            <div className="skill-icon-wrapper" style={{ '--icon-color': skill.color }}>
              {skill.icon}
            </div>
            <div className="skill-text">
              <h4>{skill.name}</h4>
              <span>{skill.desc}</span>
            </div>
            <div className="skill-glow"></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Skills;