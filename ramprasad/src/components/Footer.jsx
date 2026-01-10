import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, Twitter, Linkedin, Instagram, 
  Mail, Phone, MapPin, ChevronRight,
} from 'lucide-react';
import '../Style/footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="footer-top">
        <div className="footer-container">
          
          {/* Brand Column */}
          <div className="footer-column brand-col">
            <h2 className="footer-logo">Ram Prasad<span>.</span></h2>
            <p className="footer-bio">
              Building digital experiences that blend functionality with aesthetics. 
              Based in Kathmandu, available for global projects.
            </p>
            <div className="location-tag">
              <MapPin size={14} />
              <span>Shivraj Kapilvastu , Nepal</span>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="footer-column links-col">
            <h3>Explore</h3>
            <ul className="footer-links">
              <li><Link to="/"><ChevronRight size={14} /> Home</Link></li>
              <li><Link to="/profile"><ChevronRight size={14} /> Profile</Link></li>
              <li><Link to="/gallery"><ChevronRight size={14} /> Gallery</Link></li>
              <li><Link to="/contact"><ChevronRight size={14} /> Contact</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-column contact-col">
            <h3>Contact</h3>
            <div className="contact-methods">
              <a href="mailto:ramprasadc331@gmail.com" className="contact-item">
                <Mail size={18} />
                <span>ramprasadc331@gmail.com</span>
              </a>
              <a href="tel:+9779821574168" className="contact-item">
                <Phone size={18} />
                <span>+977 9821574168</span>
              </a>
            </div>
          </div>

          {/* Social Column */}
          <div className="footer-column social-col">
            <h3>Connect</h3>
            <div className="footer-socials">
              <a href="https://www.facebook.com/ram.prasad.kurmi.977638/" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="https://www.linkedin.com/in/ram-prasad-chaudhary-312221251/" aria-label="LinkedIn"><Linkedin size={20} /></a>
              <a href="https://www.instagram.com/ramprasad10008/" aria-label="Instagram"><Instagram size={20} /></a>
             
            </div>
            <div className="status-indicator">
              <span className="pulse"></span>
              Online for Freelance
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <p>&copy; {currentYear} Ram Prasad Chaudhary. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/debug">System Debug</Link>
            <span className="separator">|</span>
            <span className="version">v2.0.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;