import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Zap, Target, Circle } from 'lucide-react';

interface AchievementItem {
  _id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const iconMap: Record<string, JSX.Element> = {
  Target: <Target className="w-8 h-8 text-white" />,
  Star: <Star className="w-8 h-8 text-white" />,
  Award: <Award className="w-8 h-8 text-white" />,
  Zap: <Zap className="w-8 h-8 text-white" />,
  Default: <Circle className="w-8 h-8 text-white" />
};

const initialAchievements: AchievementItem[] = [
  {
    _id: 'hackathon',
    title: 'Hackathon Winner',
    description: 'Secured 1st place in National Level Smart India Hackathon 2024 out of 500+ participating teams.',
    icon: 'Target',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    _id: 'competitive',
    title: 'Competitive Programming',
    description: 'Global rank under 5000 in Google HashCode and top 10% in LeetCode weekly contests.',
    icon: 'Star',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    _id: 'opensource',
    title: 'Open Source Contributor',
    description: 'Merged 20+ PRs in popular open source repositories including React and TailwindCSS.',
    icon: 'Award',
    color: 'from-green-400 to-emerald-600'
  },
  {
    _id: 'aws',
    title: 'AWS Certified',
    description: 'Achieved AWS Certified Solutions Architect credential with a perfect score in architecture design.',
    icon: 'Zap',
    color: 'from-pink-500 to-rose-600'
  }
];

export default function Achievements() {
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/achievements');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setAchievements(data);
        }
      } catch (error) {
        console.error('Error loading achievements', error);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <section id="achievements" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Honors & <span className="text-gradient">Achievements</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="glass p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-6 transform group-hover:rotate-12 transition-transform duration-300`}>
                {iconMap[item.icon] ?? iconMap.Default}
              </div>

              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed relative z-10">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
