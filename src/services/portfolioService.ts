import { apiGet } from '@services/api'
import { TECHNOLOGY_GROUPS, type Technology, type TechnologyGroup } from '@/types/technology'
import type { Profile } from '@/types/profile'
import type { ActivityStats, ContributionDay } from '@/types/activity'
import type { Experiment, ExperimentStatus } from '@/types/experiment'
import {
  REPOSITORY_CATEGORIES,
  type Repository,
  type RepositoryCategory,
  type RepositoryStatus,
} from '@/types/repository'

export type PortfolioPayload = {
  profile: Profile
  repositories: Repository[]
  technologies: Technology[]
  activity: {
    stats: ActivityStats
    days: ContributionDay[]
  }
  experiments: Experiment[]
}

const emptyProfile: Profile = {
  systemName: 'PORTFOLIO',
  rolePrimary: '',
  roleSecondary: '',
  headline: '',
  focusAreas: [],
  stats: { projects: 0, repositories: 0, technologies: 0, experiments: 0 },
  githubUrl: '',
  linkedinUrl: '',
  email: '',
  availableFor: [],
}

export const emptyPortfolio: PortfolioPayload = {
  profile: emptyProfile,
  repositories: [],
  technologies: [],
  activity: {
    stats: { commits: 0, repositories: 0, languages: 0, experiments: 0 },
    days: [],
  },
  experiments: [],
}

let cached: PortfolioPayload | null = null
let loadPromise: Promise<PortfolioPayload> | null = null

export function getPortfolioCache(): PortfolioPayload {
  return cached ?? emptyPortfolio
}

export function loadPortfolio(): Promise<PortfolioPayload> {
  if (!loadPromise) {
    loadPromise = fetchPortfolio().catch((error: unknown) => {
      loadPromise = null
      throw error
    })
  }
  return loadPromise
}

export function technologyGroupsFrom(technologies: Technology[]): TechnologyGroup[] {
  return TECHNOLOGY_GROUPS.filter((group) => technologies.some((item) => item.group === group))
}

async function fetchPortfolio(): Promise<PortfolioPayload> {
  const payload = await apiGet<PortfolioPayload>('/portfolio')
  cached = {
    profile: {
      ...emptyProfile,
      ...payload.profile,
      stats: { ...emptyProfile.stats, ...payload.profile?.stats },
      focusAreas: payload.profile?.focusAreas ?? [],
      availableFor: payload.profile?.availableFor ?? [],
    },
    repositories: (payload.repositories ?? []).map(normalizeRepository),
    technologies: (payload.technologies ?? []).map(normalizeTechnology),
    activity: {
      stats: {
        commits: payload.activity?.stats.commits ?? 0,
        repositories: payload.activity?.stats.repositories ?? 0,
        languages: payload.activity?.stats.languages ?? 0,
        experiments: payload.activity?.stats.experiments ?? 0,
      },
      days: (payload.activity?.days ?? []).map((day) => ({
        date: day.date,
        count: day.count,
        level: toLevel(day.level),
      })),
    },
    experiments: (payload.experiments ?? []).map(normalizeExperiment),
  }
  return cached
}

function normalizeRepository(repository: Repository): Repository {
  return {
    ...repository,
    id: String(repository.id),
    technologies: repository.technologies ?? [],
    architecture: repository.architecture ?? [],
    security: repository.security ?? [],
    category: toCategory(repository.category),
    status: toRepoStatus(repository.status),
  }
}

function normalizeTechnology(technology: Technology): Technology {
  return {
    ...technology,
    group: toTechGroup(technology.group),
  }
}

function normalizeExperiment(experiment: Experiment): Experiment {
  return {
    ...experiment,
    technologies: experiment.technologies ?? [],
    status: toExperimentStatus(experiment.status),
  }
}

function toCategory(value: string): RepositoryCategory {
  return (REPOSITORY_CATEGORIES as readonly string[]).includes(value)
    ? (value as RepositoryCategory)
    : 'Experiments'
}

function toRepoStatus(value: string): RepositoryStatus {
  if (value === 'archived' || value === 'experimental') return value
  return 'active'
}

function toTechGroup(value: string): TechnologyGroup {
  return (TECHNOLOGY_GROUPS as readonly string[]).includes(value)
    ? (value as TechnologyGroup)
    : 'Backend'
}

function toExperimentStatus(value: string): ExperimentStatus {
  if (value === 'running' || value === 'queued') return value
  return 'completed'
}

function toLevel(level: number): ContributionDay['level'] {
  if (level <= 0) return 0
  if (level >= 4) return 4
  return level as ContributionDay['level']
}
