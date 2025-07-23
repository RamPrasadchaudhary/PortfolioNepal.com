import React from 'react';
import '../Style/footer.css';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-section brand">
          <h2>Ram Prasad</h2>
          <p>Creative Web Developer focused on building beautiful, performant websites.</p>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/projects">Projects</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>Contact</h3>
          <p><a href="mailto:ramprasad@example.com">ramprasadc331@gmail.com</a></p>
          <p><a href="tel:+919876543210">+9779821574168</a></p>
        </div>

        <div className="footer-section social">
          <h3>Follow Me</h3>
          <div className="social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedinIn /></a>
            <a href="#"><FaInstagram /></a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Ram Prasad. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
