export const REPOSITORY_CATEGORIES = [
  'Backend',
  'Frontend',
  'AI / ML',
  'Security',
  'DevOps',
  'Automation',
  'Experiments',
] as const

export type RepositoryCategory = (typeof REPOSITORY_CATEGORIES)[number]

export type RepositoryStatus = 'active' | 'archived' | 'experimental'

export type RepositoryArchitectureLayer = {
  label: string
}

export type Repository = {
  id: string
  name: string
  description: string
  longDescription: string
  language: string
  technologies: string[]
  category: RepositoryCategory
  stars: number
  forks: number
  status: RepositoryStatus
  githubUrl: string
  architecture: string[]
  security: string[]
}
