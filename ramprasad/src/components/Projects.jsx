import React from 'react';
import '../Style/projects.css';

const projects = [
  {
    title: 'Portfolio Website',
    description: 'A personal portfolio built with React and modern CSS. Responsive, fast, and easy to customize.',
    link: 'https://your-portfolio-link.com',
    linkLabel: 'View Live'
  },
  {
    title: 'School Management System',
    description: 'CRUD application using Php, and MySQL. Features authentication, dashboard, and reports.',
    link: 'https://github.com/RamPrasadchaudhary/4th-semproject',
    linkLabel: 'Source Code'
  },
  {
    title: 'E-Commerce Platform',
    description: 'Full-stack MERN e-commerce app with payment integration, admin panel, and product management.',
    link: 'https://github.com/your-github-id/ecommerce-platform',
    linkLabel: 'Source Code'
  },
  {
    title: 'Hostel Management System',
    description: 'Full-stack MERN e-commerce app with payment integration, admin panel, and product management.',
    link: 'https://github.com/RamPrasadchaudhary/Hostel_Management_System',
    linkLabel: 'Source Code'
  },
  {
    title: 'Stationary Software',
    description: 'A C# language based Application that manage all the record about book stock, selling purchased etc.',
    link: 'https://github.com/RamPrasadchaudhary/BookshopManagementSystem-Csharp',
    linkLabel: 'Source Code'
  } ,
  {
    title: 'EcoMart E-commerce For College Students running....... ',
     description: 'Full-stack MERN e-commerce app with payment integration, admin panel, and product management.',
    link: 'https://github.com/your-github-id/ecommerce-platform',
    linkLabel: 'Source Code'
  }
];

const Projects = () => (
  <section id="projects" className="projects-section-flip">
    <h2 className="projects-title-flip">Projects</h2>
    <div className="projects-list-flip">
      {projects.map((project, idx) => (
        <div className="project-card-flip" key={idx} tabIndex={0}>
          <div className="project-card-inner-flip">
            <div className="project-card-front-flip">
              <h3>{project.title}</h3>
            </div>
            <div className="project-card-back-flip">
              <p>{project.description}</p>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link-flip"
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