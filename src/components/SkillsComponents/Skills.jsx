import React from 'react';
import './SkillsStyle.css';
import { FaReact, FaJsSquare, FaHtml5, FaJava, FaGithub, FaMicrochip, FaCode, FaCloud } from 'react-icons/fa';
import { RiToolsFill } from 'react-icons/ri';
import { SiPython, SiC, SiFirebase, SiFigma, SiJira } from 'react-icons/si';
import { useTranslation } from 'react-i18next';
import N8nIcon from './icons/N8nIcon';
import ScrollReveal from '../ScrollReveal';

const normalizeLanguage = (language) => (language || 'pt').split('-')[0];

const SKILL_CATALOG = {
  python: { label: { pt: 'Python', en: 'Python' }, desc: { pt: 'Linguagem de programação', en: 'Programming language' }, Icon: SiPython, cls: 'icon-python' },
  java: { label: { pt: 'Java', en: 'Java' }, desc: { pt: 'Linguagem de programação', en: 'Programming language' }, Icon: FaJava, cls: 'icon-java' },
  c: { label: { pt: 'C Language', en: 'C Language' }, desc: { pt: 'Linguagem de baixo nível', en: 'Low-level language' }, Icon: SiC, cls: 'icon-c' },
  react: { label: { pt: 'React.js', en: 'React.js' }, desc: { pt: 'Biblioteca para interfaces', en: 'UI library' }, Icon: FaReact, cls: 'icon-react' },
  javascript: { label: { pt: 'JavaScript (ES6+)', en: 'JavaScript (ES6+)' }, desc: { pt: 'Linguagem para web', en: 'Web programming language' }, Icon: FaJsSquare, cls: 'icon-js' },
  htmlcss: { label: { pt: 'HTML5 & CSS3', en: 'HTML5 & CSS3' }, desc: { pt: 'Estrutura e estilos para web', en: 'Web structure and styling' }, Icon: FaHtml5, cls: 'icon-html' },
  figma: { label: { pt: 'Figma', en: 'Figma' }, desc: { pt: 'Design de interfaces', en: 'Interface design' }, Icon: SiFigma, cls: 'icon-figma' },
  jira: { label: { pt: 'Jira', en: 'Jira' }, desc: { pt: 'Gestão de projetos ágeis', en: 'Agile project management' }, Icon: SiJira, cls: 'icon-jira' },
  vscode: { label: { pt: 'VS Code', en: 'VS Code' }, desc: { pt: 'Editor de código', en: 'Code editor' }, Icon: FaCode, cls: 'icon-vscode' },
  firebase: { label: { pt: 'Firebase', en: 'Firebase' }, desc: { pt: 'Backend e serviços em nuvem', en: 'Backend and cloud services' }, Icon: SiFirebase, cls: 'icon-firebase' },
  github: { label: { pt: 'GitHub', en: 'GitHub' }, desc: { pt: 'Controle de versão', en: 'Version control' }, Icon: FaGithub, cls: 'icon-github' },
  embedded: { label: { pt: 'Sistemas embarcados', en: 'Embedded systems' }, desc: { pt: 'Trabalho com microcontroladores', en: 'Work with microcontrollers' }, Icon: FaMicrochip, cls: 'icon-embedded' },
  n8n: { label: { pt: 'n8n', en: 'n8n' }, desc: { pt: 'Automação de workflows', en: 'Workflow automation' }, Icon: N8nIcon, cls: 'icon-n8n' },
  colab: { label: { pt: 'Google Colab', en: 'Google Colab' }, desc: { pt: 'Notebooks colaborativos', en: 'Collaborative notebooks' }, Icon: FaCloud, cls: 'icon-colab' },
};

const getSkill = (key) => SKILL_CATALOG[key] || { label: { pt: key, en: key }, desc: { pt: 'Tecnologia relacionada', en: 'Related technology' }, Icon: FaCode, cls: 'icon-default' };

const SkillGroup = ({ icon, title, items, language }) => {
  const handleMouseMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((event.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty('--mouse-x', `${mouseX}%`);
    card.style.setProperty('--mouse-y', `${mouseY}%`);
  };

  const handleMouseLeave = (event) => {
    const card = event.currentTarget;
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '35%');
  };

  return (
    <div className="skill-group" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ '--mouse-x': '50%', '--mouse-y': '35%' }}>
      <div className="group-icon">{icon}</div>
      <h3 className="group-title">{title}</h3>
      <ul className="group-list">
        {items.map((it, i) => {
          const skill = getSkill(it.key);
          const Icon = skill.Icon;
          const label = skill.label[language] || skill.label.pt;
          const desc = skill.desc[language] || skill.desc.pt;
          const cls = skill.cls;

          return (
            <li key={i} className="group-item">
              {cls === 'icon-n8n' ? (
                <span className={`item-icon ${cls}`}><N8nIcon width={28} height={28} /></span>
              ) : (
                <span className={`item-icon ${cls}`}><Icon size={18} /></span>
              )}
              <div className="item-text">
                <span className="item-title">{label}</span>
                <span className="item-desc">{desc}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Skills = () => {
  const { t, i18n } = useTranslation();
  const language = normalizeLanguage(i18n.language);

  const groups = [
    {
      title: t('skills.group1.title'),
      icon: <FaCode size={28} />,
      items: [{ key: 'python' }, { key: 'java' }, { key: 'c' }, { key: 'react' }, { key: 'javascript' }, { key: 'htmlcss' }],
    },
    {
      title: t('skills.group2.title'),
      icon: <RiToolsFill size={28} />,
      items: [{ key: 'figma' }, { key: 'jira' }, { key: 'vscode' }, { key: 'firebase' }, { key: 'github' }, { key: 'n8n' }, { key: 'colab' }],
    },
  ];

  return (
    <section className="skills" id="skills">
      <ScrollReveal>
        <h2 className="heading">
          {t('skills.heading').split(' ')[0]} <span>{t('skills.heading').split(' ').slice(1).join(' ')}</span>
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={90}>
        <p className="skills-sub">{t('skills.sub')}</p>
      </ScrollReveal>

      <div className="skills-container">
        {groups.map((g, idx) => (
          <ScrollReveal key={idx} delay={idx * 120}>
            <SkillGroup {...g} language={language} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

export default Skills;