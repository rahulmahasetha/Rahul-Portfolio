import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Mail, Code2, Download } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import profilePic from '../assets/Rahul Mahaseth.png';

export default function Hero() {
  const [resumeUrl, setResumeUrl] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/resume');
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            setResumeUrl(`http://localhost:5000${data.url}`);
          }
        }
      } catch (err) {
        console.error('Failed to load resume', err);
      }
    };
    fetchResume();
  }, []);
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-12">
        <motion.div 
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-primary font-semibold tracking-wider uppercase mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to my portfolio
          </motion.h2>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
            Hi, I'm <span className="text-primary">Rahul</span>
          </h1>
          
          <div className="text-2xl md:text-3xl font-bold text-gray-600 dark:text-gray-300 mb-6 h-12">
            <TypeAnimation
              sequence={[
                'Full Stack Developer',
                2000,
                'CSE Engineer',
                2000,
                'Python Developer',
                2000,
                'React Developer',
                2000,
                'AI Enthusiast',
                2000,
                'Problem Solver',
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto md:mx-0 mb-8 leading-relaxed">
            I build world-class, responsive, and futuristic web applications. 
            Passionate about solving complex problems with elegant code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-10">
            <motion.a 
              href={resumeUrl || '#'}
              download
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-full font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <Download size={20} />
              Download Resume
            </motion.a>
            <motion.a 
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-current rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              Contact Me
            </motion.a>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-6">
            {[
              { icon: <FaGithub size={24} />, href: "https://github.com/rahulmahasetha", label: "GitHub" },
              { icon: <FaLinkedin size={24} />, href: "https://www.linkedin.com/in/rahul-mahaseth-37651b291", label: "LinkedIn" },
              { icon: <Mail size={24} />, href: "mailto:rahulmahaseth700@gmail.com", label: "Email" },
              { icon: <Code2 size={24} />, href: "#", label: "LeetCode" }
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -5, color: '#6366f1' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="flex-1 w-full max-w-md relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative w-full aspect-square rounded-full border-2 border-primary/20 p-4">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl relative bg-primary/10 p-1">
              <img 
                src={profilePic}
                alt="Rahul Mahaseth" 
                className="w-full h-full object-cover rounded-full bg-white dark:bg-gray-900"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
