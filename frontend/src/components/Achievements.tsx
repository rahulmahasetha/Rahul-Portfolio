import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Zap, Target, Circle } from 'lucide-react';

interface AchievementItem {
  _id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  imageUrl?: string;
}

const iconMap: Record<string, JSX.Element> = {
  Target: <Target className="w-5 h-5 text-gray-500" />,
  Star: <Star className="w-5 h-5 text-gray-500" />,
  Award: <Award className="w-5 h-5 text-gray-500" />,
  Zap: <Zap className="w-5 h-5 text-gray-500" />,
  Default: <Circle className="w-5 h-5 text-gray-500" />
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
        const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/achievements');
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
    <section id="achievements" className="py-8 relative bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h6 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight">
            Honors & Achievements
          </h6>
        </motion.div>

        <div className="space-y-0">
          {achievements.map((item, index) => (
            <div key={item._id ?? index} className="flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-800 py-8 first:pt-0 last:border-0">
              <div className="md:w-1/4 mb-4 md:mb-0 pr-4 flex flex-row items-center md:items-start gap-2">
                {iconMap[item.icon] ?? iconMap.Default}
                <span className="text-xs font-mono tracking-widest text-gray-500 uppercase mt-0.5">
                  HONOR
                </span>
              </div>
              <div className="md:w-3/4">
                <h3 className="font-semibold text-xl md:text-2xl text-gray-900 dark:text-gray-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                  {item.description}
                </p>
                {item.imageUrl && (
                  <div className="mt-4">
                    <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${item.imageUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900">
                      View Certificate / Image
                    </a>
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
