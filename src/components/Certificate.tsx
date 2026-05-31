import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Download, Eye } from 'lucide-react';

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

export default function Certificate() {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [unlockedCertificates, setUnlockedCertificates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [lockedTypes, setLockedTypes] = useState<string[]>(defaultLocked);

  useEffect(() => {
    fetchCertificates();
    // Load unlocked certificates from localStorage
    const stored = localStorage.getItem('unlockedCertificates');
    if (stored) {
      setUnlockedCertificates(new Set(JSON.parse(stored)));
    }
    // fetch locked certificate types from settings
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings/certificateLocks');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setLockedTypes(data);
      } catch (err) {
        console.error('Failed to load certificate lock settings', err);
      }
    })();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/certificates');
      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }
      const data = await response.json();
      setCertificates(data);
      setError('');
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

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

  const groupedCertificates = certificates.reduce((acc, cert) => {
    if (!acc[cert.category]) {
      acc[cert.category] = [];
    }
    acc[cert.category].push(cert);
    return acc;
  }, {} as Record<string, CertificateData[]>);

  if (loading) {
    return (
      <section id="certificates" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading certificates...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="certificates" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Certificates</span> & <span className="text-gradient">Credentials</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </motion.div>

        {error && (
          <motion.div 
            className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-8 text-red-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {certificates.length === 0 ? (
          <motion.div 
            className="text-center text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>No certificates available yet.</p>
          </motion.div>
        ) : (
          Object.entries(groupedCertificates).map(([category, certs]) => (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
                {category}
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certs.map((cert, index) => {
                  const isLocked = isCertificateLocked(cert.certificateType);
                  const isUnlocked = isCertificateUnlocked(cert._id);
                  const showImage = !isLocked || isUnlocked;

                  return (
                    <motion.div
                      key={cert._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                      className="group relative"
                    >
                      {/* Certificate Card */}
                      <div className="glass rounded-2xl overflow-hidden h-full flex flex-col relative">
                        {/* Image Container */}
                        <div className="relative h-64 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                          {showImage ? (
                            <motion.img
                              src={`http://localhost:5000${cert.imageUrl}`}
                              alt={cert.title}
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.05 }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                              <Lock className="w-16 h-16 text-gray-400" />
                              <p className="text-gray-400 text-sm">Click lock icon to unlock</p>
                            </div>
                          )}

                          {/* Lock/Unlock Button */}
                          {isLocked && (
                            <motion.button
                              onClick={() => toggleCertificateLock(cert._id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-all duration-200 backdrop-blur-md"
                              title={isUnlocked ? 'Lock' : 'Unlock'}
                            >
                              {isUnlocked ? (
                                <Unlock className="w-5 h-5 text-yellow-400" />
                              ) : (
                                <Lock className="w-5 h-5 text-red-400" />
                              )}
                            </motion.button>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                              {cert.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <span className="font-semibold">{cert.organization}</span>
                            </p>
                            {cert.certificateType && (
                              <p className="text-xs text-primary dark:text-blue-400 mb-2">
                                {cert.certificateType}
                              </p>
                            )}
                            {cert.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {cert.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(cert.issueDate).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            {showImage && (
                              <motion.button
                                onClick={() => {
                                  setSelectedCertificate(cert);
                                  setShowModal(true);
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white py-2 rounded-lg hover:shadow-lg transition-all"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </motion.button>
                            )}
                            {showImage && (
                              <motion.a
                                href={`http://localhost:5000${cert.pdfUrl || cert.imageUrl}`}
                                download
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-all"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </motion.a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal for viewing full certificate */}
      {showModal && selectedCertificate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">
                  {selectedCertificate.title}
                </h3>
                <motion.button
                  onClick={() => setShowModal(false)}
                  whileHover={{ scale: 1.1 }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </motion.button>
              </div>
              <img
                src={`http://localhost:5000${selectedCertificate.imageUrl}`}
                alt={selectedCertificate.title}
                className="w-full rounded-lg mb-6"
              />
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Organization</p>
                  <p className="text-white font-semibold">{selectedCertificate.organization}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Issue Date</p>
                  <p className="text-white font-semibold">
                    {new Date(selectedCertificate.issueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <a
                href={`http://localhost:5000${selectedCertificate.pdfUrl || selectedCertificate.imageUrl}`}
                download
                className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Download Certificate
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
