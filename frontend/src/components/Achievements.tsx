import { resolveMediaUrl } from '../utils/url';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Zap, Target, Circle } from 'lucide-react';
import { usePortfolioData } from '../hooks/usePortfolioData';

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

const Achievements = memo(function Achievements() {
  const { data, isLoading } = usePortfolioData();
  const achievements: AchievementItem[] = data?.achievements || [];
  const loading = isLoading;

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
          <h6 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary tracking-tight">
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
                    <a href={resolveMediaUrl(item.imageUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900">
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
});

export default Achievements;
