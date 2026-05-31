import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Certificate from './components/Certificate';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Admin from './components/Admin';
import { motion, useScroll, useSpring } from 'framer-motion';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isAdminPath, setIsAdminPath] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
    setIsAdminPath(path === '/adminportal' || path === '/adminportal/');
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-[#0a0a0a]' : 'bg-white'}`}>
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary transform origin-left z-[100]"
        style={{ scaleX }}
      />

      {isAdminPath ? (
        <Admin isAdminPath={true} />
      ) : (
        <>
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
          <main>
            <Hero />
            <About />
            <Skills />
            <Certificate />
            <Projects />
            <Experience darkMode={darkMode} />
            <Achievements />
            <Contact />
          </main>
          <Admin isAdminPath={false} />
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
