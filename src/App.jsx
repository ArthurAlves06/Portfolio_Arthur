import React, { useEffect, useRef } from 'react';
import Header from './components/HeaderComponents/Header'; // ADICIONADO
import Hero from './components/HeroComponents/Hero'; 
import Skills from './components/SkillsComponents/Skills'; 
import Projects from './components/ProjectsComponents/Projects';
import Education from './components/EducationComponents/Education'; 
import Footer from './components/FooterComponents/Footer'; 
import Contact from './components/ConctactComponents/Contact';
import AdminDashboard from './components/AdminComponents/AdminDashboard';
import { trackEvent } from './utils/analytics';

function App() {
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackEvent('page_view', { route: window.location.pathname, page: isAdminRoute ? 'admin' : 'home' });
  }, [isAdminRoute]);

  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  return (
    <React.Fragment>
      <Header /> 
      <Hero /> 
      <Projects />
      <Skills /> 
      <Education /> 
      <Contact />   
      <Footer /> 
    </React.Fragment>
  );
}

export default App;