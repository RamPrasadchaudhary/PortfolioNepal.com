import React from 'react';
import '../Style/about.css';

const About = () => (
  <section id="about" className="about-section-adv">
    <div className="about-card-adv">
      <div className="about-avatar-adv">
        <img
          src="https://avatars.githubusercontent.com/u/1?v=4"
          alt="Ram Prasad"
        />
      </div>
      <div className="about-info-adv">
        <h2 className="about-title-adv">About Me</h2>
        <p>
          <span className="about-highlight-adv">I'm a passionate Web Developer</span> with strong skills in both frontend and backend technologies. I specialize in creating <b>fast</b>, <b>responsive</b>, and <b>user-friendly</b> applications.<br /><br />
          My expertise includes <span className="about-skills-adv">React, Node.js, Express, MongoDB, MySQL, and UI/UX design</span>. I love to learn new technologies and contribute to open source.
        </p>
        <ul className="about-list-adv">
          <li><span>🌟</span> 3+ years of coding experience</li>
          <li><span>🚀</span> Built 10+ real-world projects</li>
          <li><span>🤝</span> Open Source Contributor</li>
        </ul>
      </div>
    </div>
  </section>
);

export default About;