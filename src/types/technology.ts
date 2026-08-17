export const TECHNOLOGY_GROUPS = [
  'Backend',
  'Frontend',
  'Database',
  'DevOps',
  'AI / ML',
] as const

export type TechnologyGroup = (typeof TECHNOLOGY_GROUPS)[number]

export type Technology = {
  id: string
  name: string
  group: TechnologyGroup
  summary: string
}
