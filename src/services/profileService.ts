import { getPortfolioCache } from '@services/portfolioService'
import type { Profile } from '@/types/profile'

export function getProfile(): Profile {
  return getPortfolioCache().profile
}
