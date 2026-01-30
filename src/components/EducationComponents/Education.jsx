import React from 'react';
import './EducationStyle.css';
import CertificateCard from './CertificateCard';

const EducationItem = ({ date, title, institution, description }) => (
  <div className="education-item">
    <span className="date">
      <i className="fa-solid fa-calendar-days"></i> {date}
    </span>
    <h3>{title}</h3>
    <h4>{institution}</h4>
    <p>{description}</p>
  </div>
);

const Education = () => {
  const certificates = [
    {
      title: 'React: hooks, context, performance',
      issuer: 'Alura',
      date: '2024',
      skills: [
        'React Hooks (useState, useEffect, useContext)',
        'Context API',
        'Performance Optimization',
        'Component Lifecycle',
        'Best Practices'
      ],
      certificateImage: null,
      link: 'https://alura.com.br'
    },
    {
      title: 'JavaScript ES6+',
      issuer: 'Alura',
      date: '2024',
      skills: [
        'Arrow Functions',
        'Destructuring',
        'Spread Operator',
        'Promises & Async/Await',
        'Modern JavaScript Patterns'
      ],
      certificateImage: null,
      link: 'https://alura.com.br'
    },
    {
      title: 'HTML5 & CSS3 Avançado',
      issuer: 'Alura',
      date: '2023',
      skills: [
        'Flexbox & Grid',
        'Responsive Design',
        'CSS Animations',
        'Semantic HTML',
        'Web Accessibility'
      ],
      certificateImage: null,
      link: 'https://alura.com.br'
    }
  ];

  return (
    <section className="education" id="education">
      <h2 className="heading">
        My <span>Journey</span>
      </h2>

      <div className="education-row">
        <div className="education-column">
          <h3 className="title">Education</h3>

          <div className="education-box">
            <EducationItem
              date="2023 - 2027 (Expected)"
              title="Bachelor's Degree in Software Engineering"
              institution="Unicesumar University"
              description="Currently enrolled in the 5th semester."
            />

            <EducationItem
              date="2024 - Present"
              title="Online Courses in Software Development"
              institution="Alura"
              description="Continuous learning focused on programming, software development, and industry best practices."
            />
          </div>
        </div>
      </div>

      {/* Nova Seção de Certificados */}
      <div className="certificates-section">
        <h3 className="certificates-title">Certificates</h3>
        <div className="certificates-grid">
          {certificates.map((cert, idx) => (
            <CertificateCard key={idx} {...cert} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
