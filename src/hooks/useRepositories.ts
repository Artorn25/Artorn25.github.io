import { getRepositorySummary, type RepositoryFilter } from '@services/repositoryService'
import { useMemo } from 'react'
import { usePortfolio } from '@context/PortfolioContext'

export function useRepositoryFeed() {
  const { repositories, loading, error } = usePortfolio()
  return { repositories, loading, error }
}

export function useRepositories(filter: RepositoryFilter = 'all') {
  const { repositories } = usePortfolio()
  return useMemo(
    () => (filter === 'all' ? repositories : repositories.filter((item) => item.category === filter)),
    [filter, repositories],
  )
}

export function useAllRepositories() {
  return usePortfolio().repositories
}

export function useRepositorySummary() {
  const repositories = useAllRepositories()
  return useMemo(() => getRepositorySummary(repositories), [repositories])
}

export function useRepositoriesForTechnology(technology: string | null) {
  const repositories = useAllRepositories()
  return useMemo(() => {
    if (!technology) return []
    return repositories.filter((repository) => repository.technologies.includes(technology))
  }, [repositories, technology])
}
