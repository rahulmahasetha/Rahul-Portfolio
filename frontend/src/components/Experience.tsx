import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ExperienceItem {
  _id: string;
  projectName: string;
  role: string;
  organization: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
}

export default function Experience({ darkMode }: { darkMode: boolean }) {
  const [items, setItems] = useState<ExperienceItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/experience');
        if (!res.ok) return;
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load experience', err);
      }
    };
    load();
  }, []);

  return (
    <section id="experience" className="py-8 relative bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight">
            Experience
          </h2>
        </motion.div>

        <div className="space-y-0">
          {items.map((item, index) => {
            const descriptionLines = item.description.split('\n').filter(line => line.trim() !== '');
            return (
              <div key={item._id ?? index} className="flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-800 py-8 first:pt-0 last:border-0">
                <div className="md:w-1/4 mb-4 md:mb-0 pr-4">
                  <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">
                    {item.startDate} — {item.endDate}
                  </span>
                </div>
                <div className="md:w-3/4">
                  <h3 className="font-semibold text-xl md:text-2xl text-gray-900 dark:text-gray-100">{item.role}</h3>
                  <h4 className="text-gray-500 dark:text-gray-400 mt-1 mb-6 text-base">
                    {item.projectName} · {item.organization}
                  </h4>
                  <ul className="space-y-4">
                    {descriptionLines.map((line, i) => (
                      <li key={i} className="flex text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                        <span className="text-[#db5b44] mr-3 mt-0.5 font-bold">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  {item.imageUrl && (
                    <div className="mt-6">
                      <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${item.imageUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900">
                        View Certificate / Image
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
