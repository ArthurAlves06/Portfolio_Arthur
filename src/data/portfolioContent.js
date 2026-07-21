import XadrezImage from '../assets/Xadrez.jpeg';
import JogoDaVelhaImage from '../assets/jogo da velha.png';
import cheilaAdm from '../assets/cheilaAdm.png';
import imobiliariaValdinei from '../assets/imobiliariaValdinei.png';
import dashBoardN8n from '../assets/DashBoard_n8n.png';
import N8nIcon from '../components/SkillsComponents/icons/N8nIcon';
import { FaDocker, FaCloud, FaReact, FaTools } from 'react-icons/fa';
import { SiDocker, SiGooglecolab, SiFirebase, SiHtml5 } from 'react-icons/si';
import { BiCode } from 'react-icons/bi';

export const defaultProjects = [
  {
    id: 1,
    title: { pt: 'Newsletter & Mentoria', en: 'Newsletter & Mentoring' },
    category: { pt: 'Site', en: 'Website' },
    image: cheilaAdm,
    description: { pt: 'Site com blog e sistema de mentoria, painel administrativo e integração com Firebase.', en: 'Website with blog and mentoring system, admin panel and Firebase integration.' },
    liveUrl: 'https://cheilalamour.web.app',
    repoUrl: 'https://github.com/The-Wavem/cheila_lamaour',
    imageAlt: { pt: 'Tela do projeto Newsletter e Mentoria', en: 'Screenshot of Newsletter & Mentoring project' },
    tools: [
      { name: 'React', Icon: FaReact },
      { name: 'Firebase', Icon: SiFirebase },
      { name: 'Material UI', Icon: FaTools },
      { name: 'HTML', Icon: SiHtml5 },
    ],
  },
  {
    id: 2,
    title: { pt: 'Imobiliária Valdinei Souza', en: 'Valdinei Souza Real Estate' },
    category: { pt: 'Site', en: 'Website' },
    image: imobiliariaValdinei,
    description: { pt: 'Plataforma web imobiliária para apresentação e busca de imóveis, com integração com Firebase e layout responsivo.', en: 'Real estate web platform for property listing and search, featuring Firebase integration and a responsive layout.' },
    liveUrl: 'https://valdineisouzaimoveis.com.br',
    repoUrl: 'https://github.com/The-Wavem/imobiliaria_valdinei',
    imageAlt: { pt: 'Tela do projeto Imobiliária Valdinei Souza', en: 'Screenshot of Valdinei Souza Real Estate project' },
    tools: [
      { name: 'React', Icon: FaReact },
      { name: 'Firebase', Icon: SiFirebase },
      { name: 'Material UI', Icon: FaTools },
      { name: 'HTML', Icon: SiHtml5 },
    ],
  },
  {
    id: 3,
    title: { pt: 'Dashboard & Automação n8n', en: 'n8n Dashboard & Automation' },
    category: { pt: 'Automação & Dashboard', en: 'Automation & Dashboard' },
    image: dashBoardN8n,
    description: { pt: 'Painel interativo conectado a fluxos de automação no n8n, hospedado via Docker e com processamento de dados via Google Colab.', en: 'Interactive dashboard connected to n8n automation workflows, containerized with Docker and featuring data processing via Google Colab.' },
    liveUrl: 'https://dashboard-n8n-32f5f.web.app',
    repoUrl: 'https://github.com/ArthurAlves06/dashboard-n8n',
    imageAlt: { pt: 'Tela do projeto Dashboard n8n', en: 'Screenshot of n8n Dashboard project' },
    tools: [
      { name: 'n8n', Icon: N8nIcon },
      { name: 'Docker', Icon: SiDocker },
      { name: 'Google Colab', Icon: SiGooglecolab },
      { name: 'React', Icon: FaReact },
      { name: 'Firebase', Icon: SiFirebase },
    ],
  },
  {
    id: 4,
    title: { pt: 'Xadrez em C', en: 'Chess in C' },
    category: { pt: 'Jogo', en: 'Game' },
    image: XadrezImage,
    description: { pt: 'Implementação do jogo de xadrez em C com regras básicas e interação por terminal.', en: 'Chess game implemented in C with basic rules and terminal interaction.' },
    liveUrl: null,
    repoUrl: 'https://github.com/ArthurAlves06/Xadrez',
    imageAlt: { pt: 'Projeto Xadrez em C', en: 'Chess project in C' },
    tools: [{ name: 'C', Icon: BiCode }],
  },
  {
    id: 5,
    title: { pt: 'Jogo da Velha em C', en: 'Tic-Tac-Toe in C' },
    category: { pt: 'Jogo', en: 'Game' },
    image: JogoDaVelhaImage,
    description: { pt: 'Jogo da velha em C focado em lógica de jogo e experiência no terminal.', en: 'Tic-tac-toe in C focused on game logic and terminal experience.' },
    liveUrl: null,
    repoUrl: 'https://github.com/ArthurAlves06/Jogo-da-velha',
    imageAlt: { pt: 'Projeto Jogo da Velha em C', en: 'Tic-Tac-Toe project in C' },
    tools: [{ name: 'C', Icon: BiCode }],
  },
];

export const defaultCertificates = [
  {
    id: 'cert-python-first-apps',
    title: 'PYTHON: primeiras aplicações',
    issuer: 'Alura',
    date: '2026',
    skills: [
      'Manipulação de Strings',
      'Módulos e funções',
      'Lista, laços e exceções',
      'Dicionários',
      'Consolidando os conhecimentos',
    ],
    link: 'https://cursos.alura.com.br/user/arthurdesouzaalves06/course/python-crie-sua-primeira-aplicacao/certificate',
  },
  {
    id: 'cert-computational-thinking',
    title: 'Pensamento computacional: fundamentos da computação e lógica de programação',
    issuer: 'Alura',
    date: '2026',
    skills: [
      'Fundamentos da computação',
      'Pensamento computacional',
      'Decomposição de problemas',
      'Reconhecimento de padrões',
      'Abstração',
      'Criação de algoritmos',
      'Lógica de programação',
      'Estruturas condicionais',
      'Estruturas de repetição',
    ],
    link: 'https://cursos.alura.com.br/user/arthurdesouzaalves06/course/computacao-fundamentos-computacao-pensamento-computacional/certificate',
  },
  {
    id: 'cert-http-web',
    title: 'HTTP: entendendo a web por baixo dos panos',
    issuer: 'Alura',
    date: '2026',
    skills: [
      'Protocolo HTTP',
      'Estrutura de URLs',
      'Métodos HTTP (GET, POST, etc)',
      'Status Codes',
      'Headers e requisições',
      'HTTPS e segurança na web',
      'Evolução do HTTP',
      'Cliente e Servidor',
    ],
    link: 'https://cursos.alura.com.br/certificate/4415759a-92f6-41d8-873a-ec094598fc52?lang=pt_BR',
  },
  {
    id: 'cert-pentest-web',
    title: 'PENTEST: explorando vulnerabilidades em aplicações web',
    issuer: 'Alura',
    date: '2026',
    skills: [
      'OWASP Top 10',
      'XSS e SQL Injection',
      'Falhas de autenticação e autorização',
      'Fraquezas em gerenciamento de sessão',
      'Uso de Burp Suite e scanners',
      'Técnicas de teste manual',
    ],
    link: '',
  },
];

export const clonePortfolioProjects = () => defaultProjects.map((project) => ({
  ...project,
  tools: Array.isArray(project.tools) ? project.tools.map((tool) => ({ ...tool })) : [],
}));

export const clonePortfolioCertificates = () => defaultCertificates.map((certificate) => ({
  ...certificate,
  skills: Array.isArray(certificate.skills) ? [...certificate.skills] : [],
}));

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeTools = (tools, fallback = []) => {
  if (Array.isArray(tools) && tools.length > 0) {
    return tools.map((tool) => (typeof tool === 'string' ? { name: tool } : { ...tool }));
  }
  if (hasText(tools)) {
    return String(tools).split(',').map((tool) => ({ name: tool.trim() })).filter((tool) => tool.name);
  }
  return fallback;
};

const normalizeSkills = (skills, fallback = []) => {
  if (Array.isArray(skills) && skills.length > 0) return [...skills];
  if (hasText(skills)) return String(skills).split(',').map((skill) => skill.trim()).filter(Boolean);
  return fallback;
};

export const normalizeProjectRecord = (project = {}, fallback = {}) => {
  const links = project.links || {};
  const media = project.media || {};
  return {
    id: project.id ?? fallback.id ?? `${Date.now()}`,
    title: project.title || fallback.title || '',
    category: project.category || fallback.category || '',
    description: project.description || fallback.description || '',
    image: project.image || media.src || fallback.image || '',
    imageAlt: project.imageAlt || media.alt || fallback.imageAlt || '',
    liveUrl: project.liveUrl || links.live || fallback.liveUrl || '',
    repoUrl: project.repoUrl || links.repo || fallback.repoUrl || '',
    tools: normalizeTools(project.tools, fallback.tools || []),
  };
};

export const normalizeCertificateRecord = (certificate = {}, fallback = {}) => {
  const media = certificate.media || {};
  const details = certificate.details || {};
  return {
    id: certificate.id ?? fallback.id ?? `${Date.now()}`,
    title: certificate.title || fallback.title || '',
    issuer: certificate.issuer || fallback.issuer || '',
    date: certificate.date || fallback.date || '',
    certificateImage: certificate.certificateImage || media.image || fallback.certificateImage || '',
    link: certificate.link || details.link || fallback.link || '',
    skills: normalizeSkills(certificate.skills, fallback.skills || []),
  };
};
