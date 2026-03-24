import React, { useState } from 'react';
import './ContactStyle.css';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // debug: garantir que as env vars estejam presentes
      console.log('EmailJS envs:', { serviceId, templateId, publicKey });
      if (!serviceId || !templateId || !publicKey) {
        console.error('Missing EmailJS env vars');
        alert('Faltam variáveis de ambiente EmailJS. Verifique .env e reinicie o dev server.');
        setSending(false);
        return;
      }

      const templateParams = {
        from_name: form.name,
        from_email: form.email,
        subject: form.subject,
        message: form.message,
        to_email: 'arthurdesouzaalves06@gmail.com'
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      alert(t('contact.form.success') || 'Mensagem enviada!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('EmailJS error:', err);
      alert(t('contact.form.error') || 'Erro ao enviar mensagem.');
    } finally {
      setSending(false);
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
          <form className="contact-form" onSubmit={handleSubmit}>
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
              <textarea name="message" cols="30" rows="7" placeholder={t('contact.form.placeholderMessage')} required value={form.message} onChange={handleChange}></textarea>
            </div>

            <input type="submit" disabled={sending} value={sending ? (t('contact.form.sending') || 'Enviando...') : t('contact.form.submit')} className="btn" />
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;