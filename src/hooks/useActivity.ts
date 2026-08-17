import { usePortfolio } from '@context/PortfolioContext'

export function useActivity() {
  return usePortfolio().activity
}
