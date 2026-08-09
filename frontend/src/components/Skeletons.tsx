import { motion } from 'framer-motion';

export const Shimmer = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-gray-200 dark:bg-[#1a1a1a] rounded ${className}`}>
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent z-10"
      animate={{ translateX: ['-100%', '100%'] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  </div>
);

export const AboutSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-4"
    >
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-[90%]" />
      <Shimmer className="h-4 w-[95%]" />
      <Shimmer className="h-4 w-[80%]" />
      
      <div className="pt-4 space-y-4">
        <Shimmer className="h-4 w-[92%]" />
        <Shimmer className="h-4 w-[85%]" />
        <Shimmer className="h-4 w-full" />
      </div>
    </motion.div>
  );
};

export const SkillsSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-0"
    >
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-800 py-6 first:pt-0 last:border-0">
          <div className="md:w-1/4 mb-4 md:mb-0 pr-4">
            <Shimmer className="h-4 w-24 mt-2" />
          </div>
          <div className="md:w-3/4 flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((j) => (
              <Shimmer key={j} className="h-9 w-28 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export const CertificateSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-0"
    >
      {[1, 2].map((category) => (
        <div key={category} className="border-b border-gray-200 dark:border-gray-800 py-8 first:pt-0 last:border-0">
          <Shimmer className="h-4 w-32 mb-8" />
          
          <div className="space-y-8">
            {[1, 2].map((cert) => (
              <div key={cert} className="flex flex-col md:flex-row">
                <div className="md:w-1/4 mb-4 md:mb-0 pr-4">
                  <Shimmer className="h-4 w-16 mt-1" />
                </div>
                <div className="md:w-3/4">
                  <Shimmer className="h-6 w-3/4 max-w-[400px] mb-3" />
                  <Shimmer className="h-4 w-1/2 max-w-[250px] mb-4" />
                  <Shimmer className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};
