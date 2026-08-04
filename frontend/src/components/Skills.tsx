import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../hooks/usePortfolioData';

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

const Skills = memo(function Skills() {
  const { data, isLoading } = usePortfolioData();
  const rawSkills = data?.skills || [];
  const loading = isLoading;

  const skillCategories = useMemo(() => {
    if (rawSkills.length > 0) {
      const categories = rawSkills.reduce<Record<string, SkillItem[]>>((acc: Record<string, SkillItem[]>, skill: SkillItem) => {
        const key = skill.category || 'Other';
        acc[key] = acc[key] || [];
        acc[key].push(skill);
        return acc;
      }, {});
      return Object.keys(categories).map((title) => ({ title, skills: categories[title] }));
    }
    return [];
  }, [rawSkills]);

  return (
    <section id="skills" className="py-8 relative bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight">
            Skills
          </h2>
        </motion.div>

        <div className="space-y-0">
          {loading && (
            <div className="text-gray-500">Loading skills...</div>
          )}

          {!loading && skillCategories.length === 0 && (
            <div className="text-gray-500">No skills available yet.</div>
          )}

          {!loading && skillCategories.length > 0 && (
            skillCategories.map((category, catIndex) => (
              <div key={category.title} className="flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-800 py-6 first:pt-0 last:border-0">
                <div className="md:w-1/4 mb-4 md:mb-0 pr-4">
                  <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">
                    {category.title}
                  </span>
                </div>
                <div className="md:w-3/4 flex flex-wrap gap-2">
                  {category.skills.flatMap(s => s.name.split(',')).map((name, i) => {
                    const trimmedName = name.trim();
                    if (!trimmedName) return null;
                    return (
                      <span key={i} className="px-4 py-2 text-sm md:text-base text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-md">
                        {trimmedName}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
});

export default Skills;
