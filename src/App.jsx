import React from 'react';
import Header from './components/HeaderComponents/Header'; // ADICIONADO
import Hero from './components/HeroComponents/Hero'; 
import Skills from './components/SkillsComponents/Skills'; 
import Education from './components/EducationComponents/Education'; 
import Footer from './components/FooterComponents/Footer'; 
import Contact from './components/ConctactComponents/Contact';

function App() {
  return (
    <React.Fragment>
      <Header /> 
      <Hero /> 
      <Skills /> 
      <Education /> 
      <Contact />   
      <Footer /> 
    </React.Fragment>
  );
}

export default App;