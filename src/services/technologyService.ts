import { getPortfolioCache, technologyGroupsFrom } from '@services/portfolioService'
import type { Technology, TechnologyGroup } from '@/types/technology'

export function getTechnologies(): Technology[] {
  return getPortfolioCache().technologies
}

export function getTechnologiesByGroup(group: TechnologyGroup): Technology[] {
  return getTechnologies().filter((technology) => technology.group === group)
}

export function getTechnologyGroups(): TechnologyGroup[] {
  return technologyGroupsFrom(getTechnologies())
}
