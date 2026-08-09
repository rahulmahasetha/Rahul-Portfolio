import { resolveMediaUrl } from '../utils/url';
import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Download, Eye } from 'lucide-react';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { CertificateSkeleton } from './Skeletons';

interface CertificateData {
  _id: string;
  title: string;
  category: string;
  certificateType: string;
  organization: string;
  issueDate: string;
  imageUrl: string;
  pdfUrl?: string;
  description?: string;
  isLocked?: boolean;
}

const defaultLocked: string[] = [];

const Certificate = memo(function Certificate() {
  const { data, isLoading } = usePortfolioData();
  const certificates: CertificateData[] = data?.certificates || [];
  const loading = isLoading;

  const getDownloadUrl = (url: string | undefined) => {
    if (!url) return '#';
    if (url.endsWith('.pdf')) return resolveMediaUrl(url);
    
    const match = url.match(/(\.[\w\d_-]+)$/i);
    if (match) {
      const originalPath = url.substring(0, url.lastIndexOf(match[1])) + '_original' + match[1];
      return resolveMediaUrl(originalPath);
    }
    return resolveMediaUrl(url);
  };

  const [unlockedCertificates, setUnlockedCertificates] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [lockedTypes, setLockedTypes] = useState<string[]>(defaultLocked);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load unlocked certificates from localStorage
    const stored = localStorage.getItem('unlockedCertificates');
    if (stored) {
      setUnlockedCertificates(new Set(JSON.parse(stored)));
    }
    // fetch locked certificate types from settings
    (async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/settings/certificateLocks');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setLockedTypes(data);
      } catch (err) {
        console.error('Failed to load certificate lock settings', err);
      }
    })();
  }, []);

  const isCertificateLocked = (certificateType: string): boolean => {
    return lockedTypes.some(type =>
      certificateType.toLowerCase().includes(type.toLowerCase())
    );
  };

  const toggleCertificateLock = (certificateId: string) => {
    const newUnlocked = new Set(unlockedCertificates);
    if (newUnlocked.has(certificateId)) {
      newUnlocked.delete(certificateId);
    } else {
      newUnlocked.add(certificateId);
    }
    setUnlockedCertificates(newUnlocked);
    localStorage.setItem('unlockedCertificates', JSON.stringify(Array.from(newUnlocked)));
  };

  const isCertificateUnlocked = (certificateId: string): boolean => {
    return unlockedCertificates.has(certificateId);
  };

  const toggleDescription = (certificateId: string) => {
    const newSet = new Set(expandedDescriptions);
    if (newSet.has(certificateId)) {
      newSet.delete(certificateId);
    } else {
      newSet.add(certificateId);
    }
    setExpandedDescriptions(newSet);
  };

  const groupedCertificates = certificates.reduce((acc, cert) => {
    if (!acc[cert.category]) {
      acc[cert.category] = [];
    }
    acc[cert.category].push(cert);
    return acc;
  }, {} as Record<string, CertificateData[]>);

  return (
    <section id="certificates" className="py-8 relative bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight">
            Certificates
          </h2>
        </motion.div>

        {error && (
          <div className="text-red-500 mb-8">{error}</div>
        )}

        <div className="space-y-0">
          {loading ? (
            <CertificateSkeleton />
          ) : certificates.length === 0 ? (
            <div className="text-gray-500">No certificates available yet.</div>
          ) : (
            Object.entries(groupedCertificates).map(([category, certs]) => (
              <div key={category} className="border-b border-gray-200 dark:border-gray-800 py-8 first:pt-0 last:border-0">
                <h3 className="text-xs font-mono tracking-widest text-gray-400 uppercase mb-8">
                  {category}
                </h3>

                <div className="space-y-8">
                  {certs.map((cert, index) => {
                    const isLocked = isCertificateLocked(cert.certificateType);
                    const isUnlocked = isCertificateUnlocked(cert._id);
                    const showImage = !isLocked || isUnlocked;

                    return (
                      <div key={cert._id} className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 mb-4 md:mb-0 pr-4">
                          <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">
                            {new Date(cert.issueDate).getFullYear()}
                          </span>
                        </div>
                        <div className="md:w-3/4">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                              {cert.title}
                            </h4>
                            {isLocked && (
                              <button onClick={() => toggleCertificateLock(cert._id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                {isUnlocked ? <Unlock className="w-4 h-4 text-yellow-500" /> : <Lock className="w-4 h-4 text-red-500" />}
                              </button>
                            )}
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-3 text-base">
                            {cert.organization}
                          </p>

                          {cert.description && (
                            <div className="mb-4">
                              <button
                                onClick={() => toggleDescription(cert._id)}
                                className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                              >
                                {expandedDescriptions.has(cert._id) ? 'Hide Description' : 'Show Description'}
                              </button>
                              {expandedDescriptions.has(cert._id) && (
                                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                                  {cert.description}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex gap-4 mt-3">
                            {showImage ? (
                              <>
                                <button onClick={() => { setSelectedCertificate(cert); setShowModal(true); }} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1">
                                  <Eye className="w-4 h-4" /> View
                                </button>
                                <a href={getDownloadUrl(cert.pdfUrl || cert.imageUrl)} download className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1">
                                  <Download className="w-4 h-4" /> Download
                                </a>
                              </>
                            ) : (
                              <span className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                <Lock className="w-4 h-4" /> Locked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for viewing full certificate */}
      {showModal && selectedCertificate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCertificate.title}
                </h3>
                <motion.button
                  onClick={() => setShowModal(false)}
                  whileHover={{ scale: 1.1 }}
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  ✕
                </motion.button>
              </div>
              <img
                src={resolveMediaUrl(selectedCertificate.imageUrl)}
                alt={selectedCertificate.title}
                className="w-full object-contain mb-8 max-h-[60vh]"
                loading="lazy"
                decoding="async"
              />
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-base">Issued by</p>
                  <p className="text-gray-900 dark:text-white font-medium text-lg">{selectedCertificate.organization}</p>
                </div>
                <a
                  href={getDownloadUrl(selectedCertificate.pdfUrl || selectedCertificate.imageUrl)}
                  download
                  className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
});

export default Certificate;
