import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Repository } from '@/types/repository'
import type { RepositoryFilter } from '@services/repositoryService'
import {
  emptyPortfolio,
  loadPortfolio,
  type PortfolioPayload,
} from '@services/portfolioService'

type PortfolioContextValue = PortfolioPayload & {
  loading: boolean
  error: string | null
  filter: RepositoryFilter
  setFilter: (filter: RepositoryFilter) => void
  hoveredRepoId: string | null
  setHoveredRepoId: (id: string | null) => void
  selectedRepo: Repository | null
  openRepository: (id: string) => void
  closeRepository: () => void
  hoveredTech: string | null
  setHoveredTech: (name: string | null) => void
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioPayload>(emptyPortfolio)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<RepositoryFilter>('all')
  const [hoveredRepoId, setHoveredRepoId] = useState<string | null>(null)
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    loadPortfolio()
      .then((payload) => {
        if (!active) return
        setData(payload)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Failed to sync GitHub portfolio')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const openRepository = useCallback(
    (id: string) => {
      const repository = data.repositories.find((item) => item.id === id)
      if (repository) setSelectedRepo(repository)
    },
    [data.repositories],
  )

  const closeRepository = useCallback(() => {
    setSelectedRepo(null)
  }, [])

  const value = useMemo(
    () => ({
      ...data,
      loading,
      error,
      filter,
      setFilter,
      hoveredRepoId,
      setHoveredRepoId,
      selectedRepo,
      openRepository,
      closeRepository,
      hoveredTech,
      setHoveredTech,
    }),
    [
      data,
      loading,
      error,
      filter,
      hoveredRepoId,
      selectedRepo,
      openRepository,
      closeRepository,
      hoveredTech,
    ],
  )

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider')
  }
  return context
}
