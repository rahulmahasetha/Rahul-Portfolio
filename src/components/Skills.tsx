import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SkillItem {
  _id: string;
  name: string;
  category: string;
  level: number;
}

interface SkillCategory {
  title: string;
  skills: SkillItem[];
}

export default function Skills() {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/skills');
        const skills = await response.json();
        if (Array.isArray(skills) && skills.length > 0) {
          const categories = skills.reduce<Record<string, SkillItem[]>>((acc, skill) => {
            const key = skill.category || 'Other';
            acc[key] = acc[key] || [];
            acc[key].push(skill);
            return acc;
          }, {});

          setSkillCategories(Object.keys(categories).map((title) => ({ title, skills: categories[title] })));
        }
      } catch (error) {
        console.error('Error loading skills', error);
      }
      finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="skills" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Technical <span className="text-gradient">Skills</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-5">
          {loading && (
            <div className="col-span-full text-center text-gray-500">Loading skills...</div>
          )}

          {!loading && skillCategories.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No skills available yet.</div>
          )}

          {!loading && skillCategories.length > 0 && (
            skillCategories.map((category, catIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                className="glass p-6 rounded-3xl"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  {category.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, index) => (
                    <motion.div 
                      key={skill._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full font-medium text-sm border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      {skill.name}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
