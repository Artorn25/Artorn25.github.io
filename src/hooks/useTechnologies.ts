import { useMemo } from 'react'
import { usePortfolio } from '@context/PortfolioContext'
import { technologyGroupsFrom } from '@services/portfolioService'

export function useTechnologies() {
  return usePortfolio().technologies
}

export function useTechnologyGroups() {
  const technologies = useTechnologies()
  return useMemo(() => technologyGroupsFrom(technologies), [technologies])
}
