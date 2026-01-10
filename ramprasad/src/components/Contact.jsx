import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import '../Style/contact.css';

const Contact = () => {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 1. Update state keys to match your template variables
  const [formData, setFormData] = useState({ 
    from_name: '', 
    reply_to: '', 
    message: '' 
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Using the IDs you provided
    const SERVICE_ID = 'service_foi4xsf';
    const TEMPLATE_ID = 'template_1i4pctj';
    const PUBLIC_KEY = 'Y1jyftv5B4cFBImkq';

    // 2. Sending the form ref directly
    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
      .then((result) => {
        setIsSubmitting(false);
        setStatus({ type: 'success', message: 'Message sent successfully!' });
        
        // Reset form to empty strings
        setFormData({ from_name: '', reply_to: '', message: '' });
        
        setTimeout(() => setStatus({ type: '', message: '' }), 5000);
      }, (error) => {
        setIsSubmitting(false);
        setStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
        console.error('EmailJS Error:', error.text);
      });
  };

  return (
    <section id="contact" className="contact-section-split">
      <div className="contact-container">
        <div className="contact-info-side">
            
          <div className="info-header">
            <h2 className="contact-title">Get In Touch</h2>
            <p>I'm currently available for freelance work or full-time positions. Let's build something great!</p>
          </div>
          <div className="map-wrapper">
             {/* Map iframe goes here */}
          </div>
        </div>

        <div className="contact-form-side">
          <div className="contact-card-modern">
            {status.message && (
              <div className={`contact-message ${status.type === 'success' ? 'success' : 'error'}`}>
                <span>{status.type === 'success' ? '✓' : '✕'} {status.message}</span>
              </div>
            )}

            <form ref={form} onSubmit={sendEmail} className="contact-form-modern">
              <div className="contact-field-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="from_name" // Matches {{from_name}} in your template
                  placeholder="Your name" 
                  value={formData.from_name}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="contact-field-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="reply_to" // Matches {{reply_to}} in your template
                  placeholder="yourName@example.com" 
                  value={formData.reply_to}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="contact-field-group">
                <label>Your Message</label>
                <textarea 
                  name="message" // Matches {{message}} in your template
                  rows="4" 
                  placeholder="How can I help you?" 
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="contact-btn-modern" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;