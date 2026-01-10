import React, { useState, useEffect } from 'react';
import '../Style/navbar.css';
import { Link } from 'react-router-dom';

const TopContactBar = ({ visible }) => (
  <div className={`top-contact-bar${visible ? '' : ' hide'}`}>
    <span>📞 +9779821574168</span>
    <span>📧 ramprasadc331@gmail.com</span>
  </div>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowTopBar(window.scrollY < 10);
          lastScrollY = window.scrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleThemeToggle = () => {
    document.body.classList.toggle('dark');
    setOpen(false);
  };

  return (
    <>
      <TopContactBar visible={showTopBar} />
      <nav className="navbar-modern">
        <div className="navbar-container">
          <Link to="/" className="nav-logo">
  Ram <span>Prasad</span>
</Link>
          <button
            className="hamburger-modern"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
          <ul className={`nav-links-modern${open ? ' open' : ''}`}>
            <li><a href="#about" onClick={() => setOpen(false)}>About</a></li>
            <li><a href="#skills" onClick={() => setOpen(false)}>Skills</a></li>
            <li><a href="#projects" onClick={() => setOpen(false)}>Projects</a></li>
            <li><a href="#contact" onClick={() => setOpen(false)}>Contact</a></li>
            <li>
              {/* <button className="toggle-btn-modern" onClick={handleThemeToggle}>
                {document.body.classList.contains('dark') ? '☀️ Light' : '🌙 Dark'}
              </button> */}
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;