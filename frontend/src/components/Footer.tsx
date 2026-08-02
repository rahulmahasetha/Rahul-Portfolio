import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrIncrementVisitor = async () => {
      try {
        const hasVisited = sessionStorage.getItem('hasVisited');
        
        let response;
        if (!hasVisited) {
          // Set to true immediately to prevent race conditions during React Strict Mode double-invoke
          sessionStorage.setItem('hasVisited', 'true');
          response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/visitor/increment`, {
            method: 'POST'
          });
        } else {
          response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/visitor/count`);
        }

        if (response.ok) {
          const data = await response.json();
          setVisitorCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching visitor count:', error);
      }
    };

    fetchOrIncrementVisitor();
  }, []);

  return (
    <footer className="py-8 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            © {new Date().getFullYear()} Rahul. All rights reserved.
          </p>
          
          {visitorCount !== null && (
            <p className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
              👁️ Visitors: {visitorCount.toLocaleString()}+
            </p>
          )}
          
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
            Built with <Heart size={16} className="text-red-500 fill-current animate-pulse" /> using React & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
