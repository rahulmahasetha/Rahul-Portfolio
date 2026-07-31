import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface EducationItem {
  _id: string;
  collegeName: string;
  degreeName: string;
  location: string;
  startYear: string;
  passingOutYear: string;
  percentage: string;
}

export default function Education({ darkMode }: { darkMode: boolean }) {
  const [items, setItems] = useState<EducationItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/education');
        if (!res.ok) return;
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load education', err);
      }
    };
    load();
  }, []);

  return (
    <section id="education" className="py-8 relative bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-10"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight">
            Education
          </h2>
        </motion.div>

        <div className="space-y-0">
          {items.map((item, index) => (
            <div key={item._id ?? index} className="flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-800 py-8 first:pt-0 last:border-0">
              <div className="md:w-1/4 mb-4 md:mb-0 pr-4">
                <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">
                  {item.startYear} — {item.passingOutYear}
                </span>
              </div>
              <div className="md:w-3/4">
                <h3 className="font-semibold text-xl md:text-2xl text-gray-900 dark:text-gray-100">{item.degreeName}</h3>
                <h4 className="text-gray-500 dark:text-gray-400 mt-1 mb-6 text-base">
                  {item.collegeName} · {item.location}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                  Score/CGPA: {item.percentage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
