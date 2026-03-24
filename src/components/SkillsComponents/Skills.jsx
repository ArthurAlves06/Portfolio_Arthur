import React from 'react';
import './SkillsStyle.css';
import { FaReact, FaJsSquare, FaHtml5, FaCss3Alt, FaJava, FaGithub, FaMicrochip, FaCode } from 'react-icons/fa';
import { RiToolsFill } from 'react-icons/ri';
import { SiPython, SiC, SiFirebase, SiFigma } from 'react-icons/si';
import { useTranslation } from 'react-i18next';

const SkillGroup = ({ icon, title, items }) => {
  const getMeta = (label) => {
    const key = (label || '').toLowerCase();
    if (key.includes('python')) return { Icon: SiPython, desc: 'Linguagem de programação', cls: 'icon-python' };
    if (key.includes('java') && !key.includes('javascript')) return { Icon: FaJava, desc: 'Linguagem de programação', cls: 'icon-java' };
    if (key === 'c language' || key === 'c') return { Icon: SiC, desc: 'Linguagem de baixo nível', cls: 'icon-c' };
    if (key.includes('react')) return { Icon: FaReact, desc: 'Biblioteca para interfaces', cls: 'icon-react' };
    if (key.includes('javascript')) return { Icon: FaJsSquare, desc: 'Linguagem para web', cls: 'icon-js' };
    if (key.includes('html')) return { Icon: FaHtml5, desc: 'Estrutura de páginas web', cls: 'icon-html' };
    if (key.includes('css')) return { Icon: FaCss3Alt, desc: 'Estilos para web', cls: 'icon-css' };
    if (key.includes('figma')) return { Icon: SiFigma, desc: 'Design de interfaces', cls: 'icon-figma' };
    if (key.includes('vs code')) return { Icon: FaCode, desc: 'Editor de código', cls: 'icon-vscode' };
    if (key.includes('firebase')) return { Icon: SiFirebase, desc: 'Backend e serviços em nuvem', cls: 'icon-firebase' };
    if (key.includes('github')) return { Icon: FaGithub, desc: 'Controle de versão', cls: 'icon-github' };
    if (key.includes('microchip') || key.includes('c language')) return { Icon: FaMicrochip, desc: 'Sistemas embarcados', cls: 'icon-embedded' };
    return { Icon: FaCode, desc: 'Tecnologia relacionada', cls: 'icon-default' };
  };

  return (
    <div className="skill-group">
      <div className="group-icon">{icon}</div>
      <h3 className="group-title">{title}</h3>
      <ul className="group-list">
        {items.map((it, i) => {
          const { Icon, desc, cls } = getMeta(it);
          return (
            <li key={i} className="group-item">
              <span className={`item-icon ${cls}`}><Icon size={18} /></span>
              <div className="item-text">
                <span className="item-title">{it}</span>
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