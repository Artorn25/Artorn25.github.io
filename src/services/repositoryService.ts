import type { Repository, RepositoryCategory } from '@/types/repository'

export type RepositoryFilter = 'all' | RepositoryCategory

export function getRepositoryById(repositories: Repository[], id: string): Repository | undefined {
  return repositories.find((repository) => repository.id === id)
}

export function getRepositorySummary(repositories: Repository[]) {
  const counts = repositories.reduce<Record<string, number>>((acc, repository) => {
    acc[repository.category] = (acc[repository.category] ?? 0) + 1
    return acc
  }, {})

  return {
    total: repositories.length,
    backend: counts.Backend ?? 0,
    frontend: counts.Frontend ?? 0,
    ai: counts['AI / ML'] ?? 0,
    security: counts.Security ?? 0,
    devops: counts.DevOps ?? 0,
    automation: counts.Automation ?? 0,
    experiments: counts.Experiments ?? 0,
  }
}
