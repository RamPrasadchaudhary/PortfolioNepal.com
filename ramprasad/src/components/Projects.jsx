import React from 'react';
import '../Style/projects.css';

const projects = [
  {
    title: 'Modern Portfolio',
    category: 'React • CSS3',
    description: 'A minimalist, SEO-optimized portfolio designed for high performance and clean user experience.',
    link: 'https://react-resume-eight.vercel.app/',
    linkLabel: 'View Demo'
  },
{
  title: 'School Website',
  category: 'MERN Stack',
  description: 'Modern school website with pages for academics, admissions, notices, events, teachers, and student information — built for easy content management.',
  link: 'https://happy-modelschool.vercel.app/',
  linkLabel: 'Source Code'
},
{
  title: 'Education Consultancy Website',
  category: 'Node • MongoDB',
  description: 'Professional consultancy website that showcases services, manages student inquiries, and features guidance pages for abroad studies and admissions.',
  link: 'https://educonsultant.vercel.app/',
  linkLabel: 'Source Code'
},
{
  title: 'YouTube Clone',
  category: 'Full Stack',
  description: 'A video-sharing platform inspired by YouTube. Supports video uploads, streaming, likes, comments, subscriptions, and user authentication.',
  link: 'https://youtube-clone-lake-tau.vercel.app/',
  linkLabel: 'Source Code'
},

  {
    title: 'Inventory Suite',
    category: 'C# • .NET',
    description: 'Desktop application for retail bookstores focused on real-time stock tracking and sales analytics.',
    link: 'https://github.com/RamPrasadchaudhary/BookshopManagementSystem-Csharp',
    linkLabel: 'Source Code'
  },
  {
    title: 'EcoMart P2P',
    category: 'In Progress',
    description: 'A sustainable marketplace for university students to exchange goods locally and securely.',
    link: '#',
    linkLabel: 'View GitHub'
  }
];

const Projects = () => (
  <section id="projects" className="projects-section-light">
    <div className="section-header">
      <span className="subtitle">My Works</span>
      <h2 className="projects-title-light">Featured Projects</h2>
    </div>

    <div className="projects-container-light">
      {projects.map((project, idx) => (
        <div className="project-card-light" key={idx} tabIndex={0}>
          <div className="card-inner-light">
            {/* Front Side */}
            <div className="card-front-light">
              <div className="category-tag">{project.category}</div>
              <h3>{project.title}</h3>
              <div className="hover-indicator">View Details →</div>
            </div>
            
            {/* Back Side */}
            <div className="card-back-light">
              <p>{project.description}</p>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-project-light"
              >
                {project.linkLabel}
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Projects;