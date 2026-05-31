import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

interface ProjectItem {
  _id: string;
  title: string;
  imageUrl: string;
  problem: string;
  features: string[];
  tech: string[];
  github: string;
  demo: string;
  description: string;
}

const placeholderProjects: ProjectItem[] = [
  {
    _id: 'flight',
    title: 'Flight Booking System',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    problem: 'Complex multi-stop flight bookings and real-time availability tracking.',
    features: ['Multi-stop routing', 'Real-time payment integration', 'Admin dashboard', 'PDF tickets'],
    tech: ['Django', 'Python', 'PostgreSQL', 'Tailwind CSS', 'JavaScript'],
    github: 'https://github.com/Rahul-Portfolio/flight-booking',
    demo: '#',
    description: ''
  },


];

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>(placeholderProjects);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      } catch (error) {
        console.error('Error loading projects', error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Featured <span className="text-primary">Projects</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6">
                  <div className="flex gap-4">
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noreferrer" className="p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all">
                        <FaGithub size={20} />
                      </a>
                    )}
                    {project.demo && (
                      <a href={project.demo} target="_blank" rel="noreferrer" className="p-3 bg-primary hover:bg-primary-dark text-white rounded-full transition-all">
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{project.title}</h3>

                <div className="mb-4">
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">Problem Solved</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{project.problem}</p>
                </div>

                <div className="mb-6 flex-1">
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider block mb-2">Key Features</span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    {project.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle2 size={16} className="text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t, i) => (
                      <span key={i} className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full border border-gray-200 dark:border-gray-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
