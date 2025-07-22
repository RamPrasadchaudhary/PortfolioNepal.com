import React from 'react';
import '../Style/contact.css';

const Contact = () => (
  <section id="contact" className="contact-section-modern">
    <div className="contact-card-modern">
      <h3 className="contact-form-title">Send a Message</h3>
      <form className="contact-form-modern" autoComplete="off">
        <div className="contact-field-group">
          <input type="text" id="name" placeholder="Your Name" required className="contact-input-modern" />
        </div>
        <div className="contact-field-group">
          <input type="email" id="email" placeholder="Your Email" required className="contact-input-modern" />
        </div>
        <div className="contact-field-group">
          <textarea id="message" rows="5" placeholder="Your Message" required className="contact-textarea-modern"></textarea>
        </div>
        <button type="submit" className="contact-btn-modern">
          <span>Send Message</span>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 8 }} viewBox="0 0 24 24">
            <path d="M22 2L11 13"></path>
            <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
          </svg>
        </button>
      </form>
    </div>
  </section>
);

export default Contact;