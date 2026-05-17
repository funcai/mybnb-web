import { describe, expect, it } from 'vitest'

import {
  searchProgressStats,
  searchProgressTargetValues,
  searchReviewProgressPercent,
  type SearchProgressStatKey,
} from './searchProgressStats'

describe('search progress stats', () => {
  it('uses visible results as matches and subtracts analyzed apartments from review queue', () => {
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
      queued: 0,
      analyzed: 27,
      matched: 7,
    })

    const displayed: Record<SearchProgressStatKey, number> = targets
    expect(
      searchProgressStats(displayed, targets, false).map(({ label, value }) => ({ label, value })),
    ).toEqual([
      { label: 'Candidates', value: 35 },
      { label: 'Queued for review', value: 0 },
      { label: 'Analyzed', value: 27 },
      { label: 'Matches', value: 7 },
    ])
  })

  it('keeps queued for review as remaining work while analysis is in progress', () => {
    expect(
      searchProgressTargetValues(
        {
          foundApartments: 35,
          requestedApartmentsForInvestigation: 27,
          returnedApartmentsToFrontend: 12,
        },
        4,
      ),
    ).toEqual({
      found: 35,
      queued: 15,
      analyzed: 12,
      matched: 4,
    })
  })

  it('bases progress percentage on analyzed over total queued for review', () => {
    expect(
      searchReviewProgressPercent({
        requestedApartmentsForInvestigation: 27,
        returnedApartmentsToFrontend: 0,
      }),
    ).toBe(0)
    expect(
      searchReviewProgressPercent({
        requestedApartmentsForInvestigation: 27,
        returnedApartmentsToFrontend: 12,
      }),
    ).toBe(44)
    expect(
      searchReviewProgressPercent({
        requestedApartmentsForInvestigation: 27,
        returnedApartmentsToFrontend: 27,
      }),
    ).toBe(100)
    expect(
      searchReviewProgressPercent({
        requestedApartmentsForInvestigation: 0,
        returnedApartmentsToFrontend: 7,
      }),
    ).toBe(0)
    expect(
      searchReviewProgressPercent({
        requestedApartmentsForInvestigation: 4,
        returnedApartmentsToFrontend: 9,
      }),
    ).toBe(100)
  })
})
