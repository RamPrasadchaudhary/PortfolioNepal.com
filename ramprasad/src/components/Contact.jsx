import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import '../Style/contact.css';

const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm(
      'service_yzrrop9',     // Replace with your EmailJS Service ID
      'template_9bxmkss',    // Replace with your EmailJS Template ID
      form.current,
      'Lixd6RDKy5kO6x-dM'      // Replace with your EmailJS Public Key
    ).then(
      (result) => {
        alert('Message sent successfully!');
        form.current.reset(); // optional: reset form after submission
      },
      (error) => {
        alert('Failed to send message. Try again.');
      }
    );
  };

  return (
    <section id="contact" className="contact-section-modern">
      <div className="contact-card-modern">
        <h3 className="contact-form-title">Send a Message</h3>
        <form ref={form} onSubmit={sendEmail} className="contact-form-modern" autoComplete="off">
          <div className="contact-field-group">
            <input type="text" name="user_name" placeholder="Your Name" required className="contact-input-modern" />
          </div>
          <div className="contact-field-group">
            <input type="email" name="user_email" placeholder="Your Email" required className="contact-input-modern" />
          </div>
          <div className="contact-field-group">
            <textarea name="message" rows="5" placeholder="Your Message" required className="contact-textarea-modern"></textarea>
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
};

export default Contact;
