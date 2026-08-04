import { motion } from 'framer-motion';
import { useEffect, useState, memo } from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';

interface AboutItem {
  _id: string;
  title: string;
  content: string;
  order: number;
}

interface StatItem {
  _id?: string;
  label: string;
  value: string;
  iconUrl?: string;
}

const About = memo(function About() {
  const { data, isLoading } = usePortfolioData();
  const aboutItems: AboutItem[] = data?.about || [];

  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/site/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    fetchStats();
  }, []);

  const loading = isLoading;

  return (
    <section id="about" className="py-8 relative bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight">
            About
          </h2>
        </motion.div>

        <div className="space-y-0">
          <div className="flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-800 py-8 first:pt-0 last:border-0">
            <div className="md:w-1/4 mb-4 md:mb-0 pr-4">
              <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">
                PROFILE
              </span>
            </div>
            <div className="md:w-3/4">
              {loading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : aboutItems.length > 0 ? (
                <div className="space-y-4">
                  {aboutItems.map((item) => (
                    <div key={item._id}>
                      {item.content.split('\n').map((p, idx) => {
                        if (!p.trim()) return null;
                        return <p key={idx} className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-base md:text-lg">{p}</p>;
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No about content configured.</p>
              )}
            </div>
          </div>

          {stats.length > 0 && (
            <div className="flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-800 py-8 first:pt-0 last:border-0">
              <div className="md:w-1/4 mb-4 md:mb-0 pr-4">
                <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">
                  STATS
                </span>
              </div>
              <div className="md:w-3/4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <div key={stat._id ?? index} className="flex flex-col">
                      <h4 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-gray-100">{stat.value}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

export default About;
