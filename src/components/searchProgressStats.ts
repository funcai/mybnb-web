import type { SearchProgress } from '../services/api'

export type SearchProgressStatKey = 'found' | 'queued' | 'analyzed' | 'matched'

export type SearchProgressStat = {
  key: SearchProgressStatKey
  label: string
  value: number
  accent: boolean
  pulse: boolean
}

export const searchProgressTargetValues = (
  progress: SearchProgress,
  resultsCount: number,
): Record<SearchProgressStatKey, number> => ({
  found: progress.foundApartments,
  queued: progress.requestedApartmentsForInvestigation,
  analyzed: progress.returnedApartmentsToFrontend,
  matched: resultsCount,
})

export const searchProgressStats = (
  displayed: Record<SearchProgressStatKey, number>,
  targetValues: Record<SearchProgressStatKey, number>,
  isLoading: boolean,
): SearchProgressStat[] => [
  {
    key: 'found',
    label: 'Candidates',
    value: displayed.found,
    accent: false,
    pulse: isLoading,
  },
  {
    key: 'queued',
    label: 'Queued for review',
    value: displayed.queued,
    accent: false,
    pulse: isLoading && targetValues.queued > 0,
  },
  {
    key: 'analyzed',
    label: 'Analyzed',
    value: displayed.analyzed,
    accent: false,
    pulse: isLoading && targetValues.analyzed > 0,
  },
  {
    key: 'matched',
    label: 'Matches',
    value: displayed.matched,
    accent: true,
    pulse: false,
  },
]

export const searchProgressPercent = (
  targetValues: Pick<Record<SearchProgressStatKey, number>, 'found'>,
  resultsCount: number,
): number => {
  const found = targetValues.found
  if (found <= 0) return 0
  return Math.min(100, Math.round((resultsCount / found) * 100))
}
