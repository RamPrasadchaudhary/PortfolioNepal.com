import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, MapPin, GraduationCap, 
  Linkedin, Github, ExternalLink, Code2 
} from 'lucide-react';
import '../Style/profile.css';
import profileImg from '../image/prasad.png'; 

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="pro-page">
      <div className="pro-container">
        
        {/* Minimal Navigation */}
        <header className="pro-nav">
          <button onClick={() => navigate('/')} className="back-action">
            <ArrowLeft size={18} /> <span>Return to Portfolio</span>
          </button>
        </header>

        <main className="pro-layout">
          {/* Sidebar: Identity */}
          <aside className="pro-sidebar">
            <div className="image-frame">
              <img src={profileImg} alt="Ram Prasad" />
            </div>
            
            <div className="pro-identity">
              <h1>Ram Prasad <br/>Chaudhary</h1>
              <p className="pro-role">Full Stack Developer</p>
              
              <div className="pro-contact-list">
                <div className="contact-row">
                  <MapPin size={16} /> <span>Kapilvastu, Nepal</span>
                </div>
                <a href="mailto:chaudharyramprasad30@gmail.com" className="contact-row link">
                  <Mail size={16} /> <span>Email Me</span>
                </a>
              </div>

              <div className="pro-socials">
                <button className="social-pill"><Linkedin size={14}/> LinkedIn</button>
                <button className="social-pill"><Github size={14}/> GitHub</button>
              </div>
            </div>
          </aside>

          {/* Main Content: The Resume */}
          <section className="pro-content">
            <div className="content-section">
              <h2 className="section-label">Summary</h2>
              <p className="bio-text">
                B.Tech Computer Engineering student at RK University with a focus on 
                scalable web architectures. Specialized in building dynamic PHP 
                applications and modern React interfaces with a commitment to 
                clean code and high-performance design.
              </p>
            </div>

            <div className="content-section">
              <h2 className="section-label">Expertise</h2>
              <div className="skill-grid">
                <div className="skill-item"><span>React.js</span></div>
                <div className="skill-item"><span>PHP Desktop</span></div>
                <div className="skill-item"><span>Node.js</span></div>
                <div className="skill-item"><span>MySQL</span></div>
                <div className="skill-item"><span>UI Design</span></div>
              </div>
            </div>

            <div className="content-section">
              <h2 className="section-label">Education</h2>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="time-meta">
                    <span className="time-period">2022 — 2026</span>
                  </div>
                  <div className="time-details">
                    <h3>B.Tech in Computer Engineering</h3>
                    <p>RK University, Rajkot, Gujarat</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="time-meta">
                    <span className="time-period">2019 — 2021</span>
                  </div>
                  <div className="time-details">
                    <h3>Higher Secondary (Science)</h3>
                    <p>Janchetana Secondary School</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Profile;