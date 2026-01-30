import React from 'react';
import './ContactStyle.css';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Contact = () => {
  return (
    <section className="contact" id="contact">
      <h2 className="heading">
        Contact <span>Me!</span>
      </h2>

      <div className="contact-grid">
        <div className="contact-left">
          <h3 className="contact-intro">Let's Work Together</h3>
          <p className="contact-intro-desc">
            I'm currently open to new opportunities. Reach out and I'll get back to you!
          </p>

          <div className="footer-contacts">
            <a className="footer-contact-item" href="mailto:arthurdesouzaalves06@gmail.com">
              <span className="icon"><FiMail /></span>
              <div className="meta">
                <small>Email</small>
                <span>arthurdesouzaalves06@gmail.com</span>
              </div>
            </a>

            <a className="footer-contact-item" href="tel:+5541988337710">
              <span className="icon"><FiPhone /></span>
              <div className="meta">
                <small>Phone</small>
                <span>(41) 98833-7710</span>
              </div>
            </a>

            <div className="footer-contact-item">
              <span className="icon"><FiMapPin /></span>
              <div className="meta">
                <small>Curitiba PR</small>
                <span>Brazil (Open to Remote)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-right">
          <form className="contact-form" action="#">
            <div className="input-row">
              <div className="input-group">
                <label>Name</label>
                <input type="text" placeholder="Full Name" required />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" placeholder="Email Address" required />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group full">
                <label>Subject</label>
                <input type="text" placeholder="Email Subject" required />
              </div>
            </div>

            <div className="input-group">
              <label>Message</label>
              <textarea name="message" cols="30" rows="7" placeholder="Your Message" required></textarea>
            </div>

            <input type="submit" value="Send Message" className="btn" />
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;