import React from 'react';
import '../Style/about.css';
import ramp from '../image/ramp.png';
import { FaDatabase, FaCode, FaServer, FaMobileAlt } from 'react-icons/fa';

const About = () => (
  <section id="about" className="about-premium-v3">
    {/* Abstract Background Decorations */}
    <div className="abstract-glow"></div>
    
    <div className="about-wrapper">
      
      {/* LEFT: The Visual Identity */}
      <div className="about-visual">
        <div className="image-blob-container">
          <img src={ramp} alt="Ram Prasad" className="profile-img" />
          
          {/* Floating Interaction Icons */}
          <div className="floating-icon icon-1"><FaCode /></div>
          <div className="floating-icon icon-2"><FaDatabase /></div>
          <div className="floating-icon icon-3"><FaServer /></div>
        </div>
        
        <div className="experience-glass-card">
          <h4>3+</h4>
          <p>Years of <br/>Innovation</p>
        </div>
      </div>

      {/* RIGHT: The Narrative */}
      <div className="about-content">
        <div className="tagline"><span>01.</span> DISCOVER MY JOURNEY</div>
        <h2 className="title-v3">
          I craft digital <br/> 
          <span className="gradient-text">Masterpieces.</span>
        </h2>
        
        <p className="description-v3">
          I am <strong>Ram Prasad</strong>, a Full-Stack Architect who treats code as art. 
          I don't just build websites; I engineer high-performance digital ecosystems 
          that drive results and captivate users.
        </p>

        <div className="skills-grid-v3">
          <div className="skill-pill">
            <FaMobileAlt className="p-icon" />
            <div>
              <h5>Frontend</h5>
              <span>React & UI/UX</span>
            </div>
          </div>
          <div className="skill-pill">
            <FaServer className="p-icon" />
            <div>
              <h5>Backend</h5>
              <span>Node & Python</span>
            </div>
          </div>
          
        </div>

        <div className="about-footer-v3">
          <a href="#contact" className="glow-button">Start a Project</a>
        </div>
      </div>

    </div>
  </section>
);

export default About;