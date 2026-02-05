import React from 'react';
import './ContactStyle.css';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  return (
    <section className="contact" id="contact">
      <h2 className="heading">
        {t('contact.heading').split(' ')[0]} <span>{t('contact.heading').split(' ').slice(1).join(' ')}</span>
      </h2>

      <div className="contact-grid">
        <div className="contact-left">
          <h3 className="contact-intro">{t('contact.intro')}</h3>
          <p className="contact-intro-desc">{t('contact.introDesc')}</p>

          <div className="footer-contacts">
            <a className="footer-contact-item" href="mailto:arthurdesouzaalves06@gmail.com">
              <span className="icon"><FiMail /></span>
              <div className="meta">
                <small>{t('contact.email')}</small>
                <span>arthurdesouzaalves06@gmail.com</span>
              </div>
            </a>

            <a className="footer-contact-item" href="tel:+5541988337710">
              <span className="icon"><FiPhone /></span>
              <div className="meta">
                <small>{t('contact.phone')}</small>
                <span>(41) 98833-7710</span>
              </div>
            </a>

            <div className="footer-contact-item">
              <span className="icon"><FiMapPin /></span>
              <div className="meta">
                <small>{t('contact.locationSmall')}</small>
                <span>{t('contact.locationDesc')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-right">
          <form className="contact-form" action="#">
            <div className="input-row">
              <div className="input-group">
                <label>{t('contact.form.labelName')}</label>
                <input type="text" placeholder={t('contact.form.placeholderName')} required />
              </div>
              <div className="input-group">
                <label>{t('contact.form.labelEmail')}</label>
                <input type="email" placeholder={t('contact.form.placeholderEmail')} required />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group full">
                <label>{t('contact.form.labelSubject')}</label>
                <input type="text" placeholder={t('contact.form.placeholderSubject')} required />
              </div>
            </div>

            <div className="input-group">
              <label>{t('contact.form.labelMessage')}</label>
              <textarea name="message" cols="30" rows="7" placeholder={t('contact.form.placeholderMessage')} required></textarea>
            </div>

            <input type="submit" value={t('contact.form.submit')} className="btn" />
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;