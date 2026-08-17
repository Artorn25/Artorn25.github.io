import { getPortfolioCache } from '@services/portfolioService'
import type { Experiment } from '@/types/experiment'

export function getExperiments(): Experiment[] {
  return getPortfolioCache().experiments
}

export function getExperimentById(id: string): Experiment | undefined {
  return getExperiments().find((experiment) => experiment.id === id)
}
