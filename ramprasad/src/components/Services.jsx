import React from 'react';
import { Monitor, Code, Globe, BookOpen, Layers, ArrowRight } from 'lucide-react'; 
import '../Style/services.css';

const Services = () => {
  const services = [
    {
      id: 1,
      icon: <BookOpen className="service-icon" />,
      title: "Online Teaching",
      description: "Personalized coding mentorship and web development courses for beginners and intermediate learners."
    },
    {
      id: 2,
      icon: <Monitor className="service-icon" />,
      title: "Web Design",
      description: "Crafting beautiful, user-friendly UI/UX designs that provide a seamless experience across all devices."
    },
    {
      id: 3,
      icon: <Layers className="service-icon" />,
      title: "Web Applications",
      description: "Building powerful, scalable, and secure web apps using modern frameworks like React and Node.js."
    },
    {
      id: 4,
      icon: <Globe className="service-icon" />,
      title: "Static Websites",
      description: "High-performance, SEO-friendly static sites for portfolios, blogs, and landing pages."
    },
    {
      id: 5,
      icon: <Code className="service-icon" />,
      title: "Dynamic Websites",
      description: "Feature-rich websites with database integration, CMS, and real-time user interactivity."
    },
    {
      id: 6,
      icon: <Monitor className="service-icon" />,
      title: "PHP Desktop Apps",
      description: "Developing standalone cross-platform desktop applications using PHP, featuring local database integration."
    }
  ];

  return (
    <section id="services" className="services-section">
      <div className="services-container">
        <div className="services-header">
          <h2 className="services-title">What I Do</h2>
          <p>Transforming your ideas into high-quality digital products with a focus on performance and design.</p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card-modern">
              <div className="icon-wrapper">
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              
              {/* Added Button */}
              <a href="#contact" className="service-btn">
                Inquire Now <ArrowRight size={18} className="btn-arrow" />
              </a>
              
              <div className="card-accent"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;