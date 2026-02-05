import React from 'react';
import './SkillsStyle.css';
import { FaReact, FaJsSquare, FaHtml5, FaCss3Alt, FaJava, FaGithub, FaMicrochip, FaCode } from 'react-icons/fa';
import { RiToolsFill } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';

const SkillGroup = ({ icon, title, items }) => (
  <div className="skill-group">
    <div className="group-icon">{icon}</div>
    <h3 className="group-title">{title}</h3>
    <ul className="group-list">
      {items.map((it, i) => (
        <li key={i} className="group-item">{it}</li>
      ))}
    </ul>
  </div>
);

const Skills = () => {
  const { t } = useTranslation();
  const groups = [
    {
      title: 'Minhas Skills',
      icon: <FaCode size={28} />,
      items: [
        'Python', 'Java', 'C Language',
        'React.js', 'JavaScript (ES6+)',
        'HTML5 & CSS3'
      ]
    }

    ,
    {
      title: 'Ferramentas', 
      icon: <RiToolsFill size={28} />,
      items: [
        'Figma', 'VS Code', 'Firebase',
        'GitHub'
      ]
    }
  ];

  return (
    <section className="skills" id="skills">
      <h2 className="heading">{t('skills.heading').split(' ')[0]} <span>{t('skills.heading').split(' ').slice(1).join(' ')}</span></h2>
      <p className="skills-sub">{t('skills.sub')}</p>

      <div className="skills-container">
        {groups.map((g, idx) => <SkillGroup key={idx} {...g} title={t(`skills.group${idx+1}.title`) || g.title} />)}
      </div>
    </section>
  );
};

export default Skills;