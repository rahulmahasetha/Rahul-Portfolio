import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

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

export default function About() {
  const [aboutItems, setAboutItems] = useState<AboutItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [aboutRes, statsRes] = await Promise.all([
          fetch('http://localhost:5000/api/about'),
          fetch('http://localhost:5000/api/site/stats')
        ]);

        if (aboutRes.ok) {
          const data = await aboutRes.json();
          setAboutItems(Array.isArray(data) ? data : []);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load about content', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            About <span className="text-gradient">Me</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass p-8 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : aboutItems.length > 0 ? (
              <div className="space-y-8">
                {aboutItems.map(item => (
                  <div key={item._id}>
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    {item.content.split('\n').map((p, idx) => {
                      if (!p.trim()) return null;
                      return <p key={idx} className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{p}</p>;
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No about content configured.</p>
            )}
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            {stats.length === 0 ? (
              <div className="col-span-full text-gray-500">No stats available.</div>
            ) : (
              stats.map((stat, index) => (
                <motion.div
                  key={stat._id ?? index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {stat.iconUrl ? (
                      <img src={stat.iconUrl} alt={stat.label} className="w-8 h-8" />
                    ) : (
                      <span className="w-8 h-8 inline-block bg-gray-200 rounded" />
                    )}
                  </div>
                  <h4 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">{stat.value}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
