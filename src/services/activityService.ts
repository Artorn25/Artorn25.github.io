import { getPortfolioCache } from '@services/portfolioService'
import type { ActivityStats, ContributionDay } from '@/types/activity'

export function getActivityStats(): ActivityStats {
  return getPortfolioCache().activity.stats
}

export function getContributionDays(): ContributionDay[] {
  return getPortfolioCache().activity.days
}
