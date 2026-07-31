import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
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
  order?: number;
}

const placeholderProjects: ProjectItem[] = [
  {
    _id: 'flight',
    title: 'Flight Booking System',
    imageUrl: '',
    problem: 'Complex multi-stop flight bookings and real-time availability tracking.',
    features: ['Multi-stop routing', 'Real-time payment integration', 'Admin dashboard', 'PDF tickets'],
    tech: ['Django', 'Python', 'PostgreSQL', 'Tailwind CSS', 'JavaScript'],
    github: 'https://github.com/Rahul-Portfolio/flight-booking',
    demo: '#',
    description: ''
  }
];

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>(placeholderProjects);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/projects');
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
    <section id="projects" className="py-8 relative bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight">
            Projects
          </h2>
        </motion.div>

        <div className="space-y-0">
          {projects.map((project, index) => (
            <div key={project._id ?? index} className="flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-800 py-8 first:pt-0 last:border-0">
              <div className="md:w-1/4 mb-4 md:mb-0 pr-4">
                <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">
                  {(index + 1).toString().padStart(2, '0')} PROJECT
                </span>
              </div>
              <div className="md:w-3/4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                  <h3 className="font-semibold text-xl md:text-2xl text-gray-900 dark:text-gray-100">{project.title}</h3>
                  <div className="flex gap-3">
                    {project.github && project.github !== '#' && (
                      <a href={project.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        <FaGithub size={18} />
                      </a>
                    )}
                    {project.demo && project.demo !== '#' && (
                      <a href={project.demo} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
                {project.problem && (
                  <div className="mb-7">
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100 block mb-1">Problem</span>
                    <h4 className="text-gray-500 dark:text-gray-400 text-base md:text-lg">
                      {project.problem}
                    </h4>
                  </div>
                )}

                {project.features && project.features.length > 0 && (
                  <div className="mb-6">
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100 block mb-3">Key Features</span>
                    <ul className="space-y-4">
                      {project.features.map((feature, i) => (
                        <li key={i} className="flex text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                          <span className="text-[#db5b44] mr-3 mt-0.5 font-bold">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.tech && project.tech.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t, i) => (
                      <span key={i} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
