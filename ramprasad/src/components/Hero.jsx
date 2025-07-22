import React, { useEffect, useState } from 'react';
import '../Style/hero.css';
import {
  FaGithub,
  FaLinkedinIn,
  FaReact,
  FaInstagram,
  FaFacebookF
} from 'react-icons/fa';

const roles = [
  'Full Stack Developer',
  'UI/UX Enthusiast',
  'Open Source Contributor',
  'Tech Blogger'
];

function Hero() {
  const [currentRole, setCurrentRole] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentRole((prev) => (prev + 1) % roles.length);
        setFade(true);
      }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section-adv hero-flex">
      <div className="hero-content-adv">
        <h1>
          Hello, I'm <span className="hero-name-adv">Ram Prasad</span>
        </h1>
        <div className={`hero-role-adv ${fade ? 'fade-in-adv' : 'fade-out-adv'}`}>
          {roles[currentRole]}
        </div>
        <p className="hero-desc-adv">
          I build modern web applications and love to solve real-world problems with code.
        </p>

        {/* ✅ Social Icons */}
        <div className="hero-socials-adv">
          <a href="https://github.com/RamPrasadchaudhary" target="_blank" rel="noopener noreferrer" title="GitHub">
            <FaGithub size={28} />
          </a>
          <a href="https://www.linkedin.com/in/ram-prasad-chaudhary-312221251" target="_blank" rel="noopener noreferrer" title="LinkedIn">
            <FaLinkedinIn size={28} color="#0a66c2" />
          </a>
        
          <a href="https://www.instagram.com/ramprasadc331/" target="_blank" rel="noopener noreferrer" title="Instagram">
            <FaInstagram size={28} color="#E1306C" />
          </a>
          <a href="https://www.facebook.com/ram.prasad.kurmi.977638/" target="_blank" rel="noopener noreferrer" title="Facebook">
            <FaFacebookF size={28} color="#1877F2" />
          </a>
        </div>

        <a href="/resume.pdf" download className="hero-resume-btn-adv">
          <span>Download Resume</span>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 8 }} viewBox="0 0 24 24">
            <path d="M12 5v14m7-7-7 7-7-7" />
          </svg>
        </a>
      </div>

      <div className="hero-avatar-adv">
        <img
          src="https://avatars.githubusercontent.com/u/1?v=4"
          alt="Ram Prasad"
        />
      </div>
    </section>
  );
}

export default Hero;
