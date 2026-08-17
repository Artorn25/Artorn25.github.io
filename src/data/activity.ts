import { createPrng } from '@lib/prng'
import type { ActivityStats, ContributionDay } from '@/types/activity'

export const activityStats: ActivityStats = {
  commits: 1284,
  repositories: 18,
  languages: 9,
  experiments: 8,
}

const WEEKS = 52
const DAYS = 7

function toLevel(count: number): ContributionDay['level'] {
  if (count === 0) return 0
  if (count < 3) return 1
  if (count < 6) return 2
  if (count < 10) return 3
  return 4
}

export function buildContributionGraph(now = new Date()): ContributionDay[] {
  const random = createPrng(20260816)
  const days: ContributionDay[] = []
  const totalDays = WEEKS * DAYS
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (totalDays - 1))

  for (let i = 0; i < totalDays; i += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const weekday = date.getDay()
    const burst = random() > 0.82 ? 8 : 0
    const base = weekday === 0 || weekday === 6 ? random() * 2 : random() * 7
    const count = Math.round(base + burst)
    days.push({
      date: date.toISOString().slice(0, 10),
      count,
      level: toLevel(count),
    })
  }

  return days
}

export const contributionDays = buildContributionGraph()
