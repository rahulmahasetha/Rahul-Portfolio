import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-8 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            © {new Date().getFullYear()} Rahul. All rights reserved.
          </p>
          
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
            Built with <Heart size={16} className="text-red-500 fill-current animate-pulse" /> using React & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
