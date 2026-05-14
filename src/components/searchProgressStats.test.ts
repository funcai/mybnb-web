import { describe, expect, it } from 'vitest'

import {
  searchProgressPercent,
  searchProgressStats,
  searchProgressTargetValues,
  type SearchProgressStatKey,
} from './searchProgressStats'

describe('search progress stats', () => {
  it('uses visible results as matches and backend returned results as analyzed', () => {
    const targets = searchProgressTargetValues(
      {
        foundApartments: 35,
        requestedApartmentsForInvestigation: 27,
        returnedApartmentsToFrontend: 27,
      },
      7,
    )

    expect(targets).toEqual({
      found: 35,
      queued: 27,
      analyzed: 27,
      matched: 7,
    })

    const displayed: Record<SearchProgressStatKey, number> = targets
    expect(
      searchProgressStats(displayed, targets, false).map(({ label, value }) => ({ label, value })),
    ).toEqual([
      { label: 'Candidates', value: 35 },
      { label: 'Queued for review', value: 27 },
      { label: 'Analyzed', value: 27 },
      { label: 'Matches', value: 7 },
    ])
  })

  it('bases progress percentage on visible matches', () => {
    expect(searchProgressPercent({ found: 35 }, 7)).toBe(20)
    expect(searchProgressPercent({ found: 0 }, 7)).toBe(0)
    expect(searchProgressPercent({ found: 4 }, 9)).toBe(100)
  })
})
