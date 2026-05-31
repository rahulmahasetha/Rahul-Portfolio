import { motion } from 'framer-motion';
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { Briefcase, GraduationCap, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TimelineItem {
  _id?: string;
  date?: string;
  title: string;
  location?: string;
  description?: string;
  type?: string;
  iconUrl?: string;
  order?: number;
}

export default function Experience({ darkMode }: { darkMode: boolean }) {
  const [items, setItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/timeline');
        if (!res.ok) return;
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load timeline', err);
      }
    };
    load();
  }, []);

  return (
    <section id="experience" className="py-20 relative bg-gray-50 dark:bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Experience & <span className="text-gradient">Education</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </motion.div>

        <VerticalTimeline lineColor={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}>
          {items.map((item, index) => {
            const icon = item.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.iconUrl} alt={item.title} className="w-5 h-5" />
            ) : item.type === 'education' ? (
              <GraduationCap />
            ) : item.type === 'certification' ? (
              <Award />
            ) : (
              <Briefcase />
            );

            return (
              <VerticalTimelineElement
                key={item._id ?? index}
                className="vertical-timeline-element"
                contentStyle={{ 
                  background: darkMode ? '#111111' : '#f8fafc', 
                  color: darkMode ? '#fff' : '#000',
                  boxShadow: 'none',
                  border: darkMode ? '1px solid #333' : '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                }}
                contentArrowStyle={{ 
                  borderRight: darkMode ? '7px solid #111111' : '7px solid #f8fafc' 
                }}
                date={item.date}
                dateClassName="text-gray-500 dark:text-gray-400 font-medium ml-4"
                iconStyle={{ 
                  background: darkMode ? '#000' : '#fff', 
                  color: darkMode ? '#fff' : '#000',
                  boxShadow: darkMode ? '0 0 0 2px #333' : '0 0 0 2px #e2e8f0'
                }}
                icon={icon}
              >
                <h3 className="vertical-timeline-element-title font-bold text-xl">{item.title}</h3>
                <h4 className="vertical-timeline-element-subtitle text-primary font-medium mt-1">{item.location}</h4>
                <p className="!font-normal !text-gray-600 dark:!text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </VerticalTimelineElement>
            );
          })}
        </VerticalTimeline>
      </div>
    </section>
  );
}
