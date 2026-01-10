import React, { useEffect, useState } from "react";
import "../Style/hero.css";
import ramp from "../image/ramp.png";
import {
  FaGithub,
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
  FaPaperPlane
} from "react-icons/fa";

const roles = [
  "Full Stack Developer",
  "Python Developer",
  "UI/UX Enthusiast",
  "Web Developer",
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
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section-adv">
      {/* Decorative Background Shapes */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      <div className="hero-container">
        <div className="hero-content-adv">
          <p className="hero-welcome">WELCOME TO MY WORLD</p>
          <h1>
            Hi, I'm <span className="hero-name-adv">Ram Prasad</span>
          </h1>
          
          <div className="role-container">
            <span className="role-static">a </span>
            <span className={`hero-role-adv ${fade ? "fade-in-adv" : "fade-out-adv"}`}>
              {roles[currentRole]}
            </span>
          </div>

          <p className="hero-desc-adv">
            I specialize in crafting high-performance, beautiful web applications. 
            Turning complex problems into elegant, user-centric solutions.
          </p>

          <div className="hero-cta-group">
            <a href="/RamChaudhary.pdf" download className="btn-primary">
              Download CV
            </a>
            <a href="#contact" className="btn-secondary">
              <FaPaperPlane /> Let's Talk
            </a>
          </div>

          <div className="hero-socials-wrapper">
            <p>FIND ME ON</p>
            <div className="hero-socials-adv">
              <a href="https://github.com/RamPrasadchaudhary" target="_blank" rel="noreferrer" className="social-icon github">
                <FaGithub />
              </a>
              <a href="https://linkedin.com/..." target="_blank" rel="noreferrer" className="social-icon linkedin">
                <FaLinkedinIn />
              </a>
              <a href="https://instagram.com/..." target="_blank" rel="noreferrer" className="social-icon instagram">
                <FaInstagram />
              </a>
              <a href="https://facebook.com/..." target="_blank" rel="noreferrer" className="social-icon facebook">
                <FaFacebookF />
              </a>
            </div>
          </div>
        </div>

        <div className="hero-avatar-wrapper">
          <div className="avatar-glass-card">
            <img src={ramp} alt="Ram Prasad" className="hero-img" />
          </div>
          {/* Floating badge example */}
          <div className="floating-badge">
            <span className="badge-icon">🚀</span>
            <span>Available for Hire</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;