export type ActivityStats = {
  commits: number
  repositories: number
  languages: number
  experiments: number
}

export type ContributionDay = {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}
