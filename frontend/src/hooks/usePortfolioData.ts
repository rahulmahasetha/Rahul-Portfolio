import { useQuery } from '@tanstack/react-query';

const fetchPortfolioData = async () => {
  const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/portfolio');
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

export function usePortfolioData() {
  return useQuery({
    queryKey: ['portfolioData'],
    queryFn: fetchPortfolioData,
  });
}
