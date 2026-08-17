import { usePortfolio } from '@context/PortfolioContext'

export function useExperiments() {
  return usePortfolio().experiments
}
