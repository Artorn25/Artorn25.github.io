export type ProfileStats = {
  projects: number
  repositories: number
  technologies: number
  experiments: number
}

export type Profile = {
  systemName: string
  rolePrimary: string
  roleSecondary: string
  headline: string
  focusAreas: string[]
  stats: ProfileStats
  githubUrl: string
  linkedinUrl: string
  email: string
  availableFor: string[]
}
