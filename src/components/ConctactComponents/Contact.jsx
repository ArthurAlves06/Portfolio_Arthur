import React, { useState } from 'react';
import './ContactStyle.css';
import { FiMail, FiPhone, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../utils/analytics';

const Contact = () => {
  const { t } = useTranslation();
  const MESSAGE_MAX = 800;
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > MESSAGE_MAX) return; // safeguard
    setForm({ ...form, [name]: value });
  };

  const handleResetMessage = () => {
    setSubmitted(false);
    setErrorMessage('');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setSubmitted(false);
    setErrorMessage('');

    try {
      const endpoint = 'https://formspree.io/f/mkopgzbn';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: new FormData(e.currentTarget),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar o formulário');
      }

      trackEvent('lead_captured', {
        name: form.name,
        email: form.email,
        subject: form.subject,
      });
      trackEvent('message_sent', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        messageLength: form.message.length,
      });

      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Formspree error:', err);
      setErrorMessage(t('contact.form.error') || 'Erro ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  };

  const mailTo = 'arthurdesouzaalves06@gmail.com';
  const handleMailClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    trackEvent('contact_click', { channel: 'email', value: mailTo });
    try {
      window.location.href = `mailto:${mailTo}`;
    } catch (err) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mailTo);
        // eslint-disable-next-line no-alert
        alert(t('contact.emailCopied') || 'E-mail copiado para a área de transferência');
      } else {
        // eslint-disable-next-line no-alert
        alert(mailTo);
      }
    }
  };

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
            <a className="footer-contact-item" href="mailto:arthurdesouzaalves06@gmail.com" onClick={handleMailClick}>
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
          <form className="contact-form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="contact-status contact-status-success" role="status" aria-live="polite">
                <div className="contact-status-icon" aria-hidden="true">
                  <FiCheckCircle />
                </div>
                <div className="contact-status-copy">
                  <strong>{t('contact.form.success')}</strong>
                  <span>{t('contact.introDesc')}</span>
                </div>
                <button type="button" className="contact-status-action" onClick={handleResetMessage}>
                  {t('contact.form.sendAnother')}
                </button>
              </div>
            ) : null}

            {errorMessage ? (
              <div className="contact-status contact-status-error" role="alert">
                <strong>{errorMessage}</strong>
              </div>
            ) : null}

            <div className="input-row">
              <div className="input-group">
                <label>{t('contact.form.labelName')}</label>
                <input name="name" type="text" placeholder={t('contact.form.placeholderName')} required value={form.name} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>{t('contact.form.labelEmail')}</label>
                <input name="email" type="email" placeholder={t('contact.form.placeholderEmail')} required value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group full">
                <label>{t('contact.form.labelSubject')}</label>
                <input name="subject" type="text" placeholder={t('contact.form.placeholderSubject')} required value={form.subject} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group">
              <label>{t('contact.form.labelMessage')}</label>
              <textarea
                name="message"
                cols="30"
                rows="7"
                placeholder={t('contact.form.placeholderMessage')}
                required
                value={form.message}
                onChange={handleChange}
                maxLength={MESSAGE_MAX}
              />
              <div className={`char-counter ${form.message.length > MESSAGE_MAX * 0.9 ? 'warn' : ''}`}>
                {form.message.length}/{MESSAGE_MAX}
              </div>
            </div>

            <button type="submit" disabled={sending} className={`btn contact-submit ${sending ? 'is-loading' : ''}`}>
              <span className="submit-label">
                {sending ? (t('contact.form.sending') || 'Enviando...') : t('contact.form.submit')}
              </span>
              {sending ? <span className="submit-spinner" aria-hidden="true" /> : null}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;