export type ExperimentStatus = 'completed' | 'running' | 'queued'

export type Experiment = {
  id: string
  index: string
  name: string
  command: string
  status: ExperimentStatus
  result: string
  technologies: string[]
}
