import { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Footer from './components/Footer';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SectionSkeleton } from './components/SectionSkeleton';
import { ImageModalProvider } from './contexts/ImageModalContext';
import { ImageModal } from './components/ImageModal';
import { IntroAnimation } from './components/IntroAnimation';

const Skills = lazy(() => import('./components/Skills'));
const Certificate = lazy(() => import('./components/Certificate'));
const Projects = lazy(() => import('./components/Projects'));
const Experience = lazy(() => import('./components/Experience'));
const Education = lazy(() => import('./components/Education'));
const Achievements = lazy(() => import('./components/Achievements'));
const Contact = lazy(() => import('./components/Contact'));
const Admin = lazy(() => import('./components/Admin/index'));

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [introComplete, setIntroComplete] = useState(() => {
    return sessionStorage.getItem('introPlayed') === 'true';
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('introPlayed', 'true');
    setIntroComplete(true);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
    setIsAdminPath(path === '/admin-rahul' || path === '/admin-rahul/');
  }, []);

  return (
    <ImageModalProvider>
      {!introComplete && <IntroAnimation onComplete={handleIntroComplete} />}
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-[#0a0a0a]' : 'bg-white'} ${!introComplete ? 'h-screen overflow-hidden' : ''}`}>
        
        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary transform origin-left z-[100]"
          style={{ scaleX }}
        />

        {isAdminPath ? (
          <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-[#0b0f19] text-white">Loading Admin...</div>}>
            <Admin isAdminPath={true} />
          </Suspense>
        ) : (
          <>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <main>
              <Hero />
              <About />
              <Suspense fallback={<SectionSkeleton />}>
                <Skills />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <Certificate />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <Projects />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <Experience darkMode={darkMode} />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <Education darkMode={darkMode} />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <Achievements />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <Contact />
              </Suspense>
            </main>
            <Suspense fallback={null}>
              <Admin isAdminPath={false} />
            </Suspense>
            <Footer />
          </>
        )}
        
        <ImageModal />
      </div>
    </ImageModalProvider>
  );
}

export default App;
