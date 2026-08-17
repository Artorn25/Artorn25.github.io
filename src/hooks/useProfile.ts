import { usePortfolio } from '@context/PortfolioContext'

export function useProfile() {
  return usePortfolio().profile
}
