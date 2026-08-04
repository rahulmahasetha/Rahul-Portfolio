import { memo, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ChevronLeft, ChevronRight, Download, Archive } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useImageModal } from '../contexts/ImageModalContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface ProjectItem {
  _id: string;
  title: string;
  imageUrl: string;
  images?: string[];
  problem: string;
  features: string[];
  tech: string[];
  github: string;
  demo: string;
  description: string;
  order?: number;
}

function resolveUrl(url: string) {
  if (!url) return '';
  return url.startsWith('http') ? url : `${API_URL}${url}`;
}

// ── Carousel component ──────────────────────────────────────────────────────
function ProjectCarousel({ project, onImageClick }: { project: ProjectItem; onImageClick: (url: string, title: string) => void }) {
  const allImages = [project.imageUrl, ...(project.images || [])].filter(Boolean);
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  const prev = useCallback(() => {
    setActiveIdx(i => (i - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  const next = useCallback(() => {
    setActiveIdx(i => (i + 1) % allImages.length);
  }, [allImages.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
    touchStartX.current = null;
  };

  const downloadZip = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects/${project._id}/download-images`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = res.headers.get('content-disposition')?.match(/filename="?([^"]+)"?/)?.[1] || `${project.title}_images.zip`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (allImages.length === 0) return null;

  // Single image — simple display without carousel chrome
  if (allImages.length === 1) {
    return (
      <div className="mb-6 mt-4 max-w-2xl">
        <div className="overflow-hidden rounded-xl bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-gray-800">
          <img
            src={resolveUrl(allImages[0])}
            alt={project.title}
            className="w-full max-h-[300px] object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            onClick={() => onImageClick(allImages[0], project.title)}
          />
        </div>
        <button
          onClick={downloadZip}
          disabled={downloading}
          className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-[#db5b44] transition-colors group"
        >
          <Download size={14} className="group-hover:scale-110 transition-transform" />
          {downloading ? 'Preparing…' : 'Download original image'}
        </button>
      </div>
    );
  }

  // Multi-image carousel
  return (
    <div className="mb-6 mt-4 max-w-2xl">
      {/* Main slide */}
      <div
        className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={activeIdx}
          src={resolveUrl(allImages[activeIdx])}
          alt={`${project.title} – ${activeIdx + 1}`}
          className="w-full max-h-[300px] object-cover cursor-pointer"
          onClick={() => onImageClick(allImages[activeIdx], project.title)}
          style={{ display: 'block' }}
        />

        {/* Arrows */}
        <button
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          aria-label="Next image"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
        >
          <ChevronRight size={18} />
        </button>

        {/* Counter badge */}
        <span className="absolute bottom-2 right-3 text-xs text-white/80 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {activeIdx + 1} / {allImages.length}
        </span>
      </div>

      {/* Thumbnails */}
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {allImages.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
              i === activeIdx
                ? 'border-[#db5b44] opacity-100 scale-105'
                : 'border-transparent opacity-60 hover:opacity-90'
            }`}
          >
            <img src={resolveUrl(img)} alt={`thumb-${i}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Download all button */}
      <button
        onClick={downloadZip}
        disabled={downloading}
        className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-[#db5b44] transition-colors group"
      >
        <Archive size={14} className="group-hover:scale-110 transition-transform" />
        {downloading ? 'Preparing ZIP…' : `Download all ${allImages.length} images (.zip)`}
      </button>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
const Projects = memo(function Projects() {
  const { data, isLoading: _loading } = usePortfolioData();
  const { openImage } = useImageModal();
  const projects: ProjectItem[] = data?.projects || [];

  return (
    <section id="projects" className="py-8 relative bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight">
            Projects
          </h2>
        </motion.div>

        <div className="space-y-0">
          {projects.map((project, index) => (
            <div key={project._id ?? index} className="flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-800 py-8 first:pt-0 last:border-0">
              <div className="md:w-1/4 mb-4 md:mb-0 pr-4">
                <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">
                  {(index + 1).toString().padStart(2, '0')} PROJECT
                </span>
              </div>
              <div className="md:w-3/4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                  <h3 className="font-semibold text-xl md:text-2xl text-gray-900 dark:text-gray-100">{project.title}</h3>
                  <div className="flex gap-3">
                    {project.github && project.github !== '#' && (
                      <a href={project.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        <FaGithub size={18} />
                      </a>
                    )}
                    {project.demo && project.demo !== '#' && (
                      <a href={project.demo} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Carousel (single or multi-image) */}
                <ProjectCarousel project={project} onImageClick={openImage} />

                {project.problem && (
                  <div className="mb-7">
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100 block mb-1">Problem</span>
                    <h4 className="text-gray-500 dark:text-gray-400 text-base md:text-lg">
                      {project.problem}
                    </h4>
                  </div>
                )}

                {project.features && project.features.length > 0 && (
                  <div className="mb-6">
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100 block mb-3">Key Features</span>
                    <ul className="space-y-4">
                      {project.features.map((feature, i) => (
                        <li key={i} className="flex text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                          <span className="text-[#db5b44] mr-3 mt-0.5 font-bold">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.tech && project.tech.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t, i) => (
                      <span key={i} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-md">
                        {t}
                      </span>
                    ))}
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

export default Projects;
